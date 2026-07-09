"""
Face recognition service — now backed by PostgreSQL instead of local faces.db.
Safe for multiple pods / HPA scaling, since Postgres handles concurrent access
correctly (unlike SQLite/pickle files on ephemeral pod storage).
"""

import cv2
import numpy as np
from numpy.linalg import norm
from typing import Optional, Tuple, Dict
import logging

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import FaceEmbedding

try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    logging.error("InsightFace not installed! Install with: pip install insightface")

logger = logging.getLogger(__name__)

EMBEDDING_DTYPE = np.float32  # InsightFace embeddings are 512-D float32 vectors


class FaceRecognitionService:
    def __init__(self):
        if not INSIGHTFACE_AVAILABLE:
            raise ImportError("InsightFace not installed!")

        logger.info("Loading InsightFace model...")
        self.app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        logger.info("InsightFace model loaded")

    def get_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """Generate face embedding from an image file (unchanged logic)."""
        img = cv2.imread(image_path)
        if img is None:
            logger.error(f"Image not found: {image_path}")
            return None

        faces = self.app.get(img)
        if len(faces) == 0:
            logger.warning("No face detected.")
            return None

        face = faces[0]
        return face.embedding

    def cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Unchanged — same formula as before."""
        return float(np.dot(a, b) / (norm(a) * norm(b)))

    def register_face(
        self,
        student_email: str,
        roll_number: str,
        student_name: str,
        photo_path: str,
    ) -> Tuple[bool, str]:
        """Register a student's face — now writes to Postgres instead of faces.db."""
        db: Session = SessionLocal()
        try:
            emb = self.get_embedding(photo_path)
            if emb is None:
                return False, "No face detected in photo. Please capture a clear photo showing your face."

            emb_bytes = emb.astype(EMBEDDING_DTYPE).tobytes()

            existing = db.query(FaceEmbedding).filter(
                FaceEmbedding.roll_number == roll_number
            ).first()

            if existing:
                existing.name = student_name
                existing.email = student_email
                existing.photo_path = photo_path
                existing.embedding = emb_bytes
            else:
                new_record = FaceEmbedding(
                    roll_number=roll_number,
                    name=student_name,
                    email=student_email,
                    photo_path=photo_path,
                    embedding=emb_bytes,
                )
                db.add(new_record)

            db.commit()
            logger.info(f"Saved embedding for: {student_name} ({roll_number})")
            return True, f"Face registered successfully for {student_name}"

        except Exception as e:
            db.rollback()
            logger.error(f"Error registering face: {str(e)}")
            return False, f"Error: {str(e)}"

        finally:
            db.close()

    def verify_face(
        self,
        photo_path: str,
        threshold: float = 0.35,
    ) -> Tuple[bool, Optional[Dict], float]:
        """Verify a face against all registered embeddings — now reads from Postgres."""
        db: Session = SessionLocal()
        try:
            emb_new = self.get_embedding(photo_path)
            if emb_new is None:
                return False, None, 0.0

            all_faces = db.query(FaceEmbedding).all()

            if not all_faces:
                logger.warning("No registered faces in database")
                return False, None, 0.0

            best_name = None
            best_roll = None
            best_email = None
            best_score = 0.0

            for record in all_faces:
                emb_saved = np.frombuffer(record.embedding, dtype=EMBEDDING_DTYPE)
                score = self.cosine_similarity(emb_new, emb_saved)

                if score > best_score:
                    best_score = score
                    best_name = record.name
                    best_roll = record.roll_number
                    best_email = record.email

            logger.info(f"Similarity Score: {best_score:.4f}")

            if best_score > threshold:
                logger.info(f"Matched: {best_name}")
                return True, {
                    "name": best_name,
                    "roll_number": best_roll,
                    "email": best_email,
                }, best_score
            else:
                logger.info("Unknown face")
                return False, None, best_score

        except Exception as e:
            logger.error(f"Error verifying face: {str(e)}")
            return False, None, 0.0

        finally:
            db.close()


# Singleton instance
_face_service_instance = None


def get_face_service() -> FaceRecognitionService:
    """Get or create face recognition service instance."""
    global _face_service_instance
    if _face_service_instance is None:
        _face_service_instance = FaceRecognitionService()
    return _face_service_instance
