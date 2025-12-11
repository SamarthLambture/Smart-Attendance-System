"""
Wrapper for YOUR existing InsightFace face recognition system
Matches YOUR face_test.py EXACTLY
"""

import cv2
import numpy as np
import pickle
import os
from pathlib import Path
from typing import Optional, Tuple, Dict
import logging
from numpy.linalg import norm

# Import YOUR InsightFace setup
try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    logging.error("InsightFace not installed! Install with: pip install insightface")

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self, db_path: str = "faces.db"):
        """
        Wrapper for YOUR existing InsightFace system
        Uses YOUR exact logic from face_test.py
        
        Args:
            db_path: Path to YOUR existing faces.db (pickle format)
        """
        if not INSIGHTFACE_AVAILABLE:
            raise ImportError("InsightFace not installed!")
        
        self.db_path = Path(db_path)
        
        # Initialize InsightFace app (YOUR EXACT setup)
        logger.info("Loading InsightFace model...")
        self.app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        logger.info("✅ InsightFace model loaded")
    
    def load_db(self) -> dict:
        """Load or create embedding database (YOUR method)"""
        if self.db_path.exists():
            with open(self.db_path, "rb") as f:
                return pickle.load(f)
        return {}  # empty database
    
    def save_db(self, db: dict):
        """Save embedding database (YOUR method)"""
        with open(self.db_path, "wb") as f:
            pickle.dump(db, f)
    
    def get_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """
        Generate face embedding (YOUR EXACT method)
        
        Args:
            image_path: Path to image file
            
        Returns:
            512-D embedding vector or None if no face detected
        """
        img = cv2.imread(image_path)
        if img is None:
            logger.error(f"❌ Error: Image not found: {image_path}")
            return None
        
        faces = self.app.get(img)
        if len(faces) == 0:
            logger.warning("❌ No face detected.")
            return None
        
        face = faces[0]  # take first detected face (YOUR logic)
        embedding = face.embedding  # 512-D vector
        return embedding
    
    def cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """
        Compare two embeddings (YOUR EXACT method)
        
        Args:
            a, b: Face embeddings
            
        Returns:
            Cosine similarity score (0-1, higher is better)
        """
        return np.dot(a, b) / (norm(a) * norm(b))
    
    def register_face(
        self, 
        student_email: str,
        roll_number: str,
        student_name: str,
        photo_path: str
    ) -> Tuple[bool, str]:
        """
        Register a new student's face using YOUR system
        
        Args:
            student_email: Student's email
            roll_number: Student's roll number
            student_name: Student's name
            photo_path: Path to student's photo
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # Get embedding using YOUR method
            emb = self.get_embedding(photo_path)
            if emb is None:
                return False, "No face detected in photo. Please capture a clear photo showing your face."
            
            # Load database (YOUR method)
            db = self.load_db()
            
            # Store with roll_number as key (matching YOUR system)
            # Note: YOUR original uses 'name', but we'll use roll_number for uniqueness
            db[roll_number] = {
                'embedding': emb,
                'name': student_name,
                'email': student_email,
                'roll_number': roll_number,
                'photo_path': photo_path
            }
            
            # Save database (YOUR method)
            self.save_db(db)
            
            logger.info(f"✅ Saved embedding for: {student_name} ({roll_number})")
            return True, f"Face registered successfully for {student_name}"
            
        except Exception as e:
            logger.error(f"Error registering face: {str(e)}")
            return False, f"Error: {str(e)}"
    
    def verify_face(
        self, 
        photo_path: str,
        threshold: float = 0.35
    ) -> Tuple[bool, Optional[Dict], float]:
        """
        Verify if a face matches any registered student using YOUR system
        
        Args:
            photo_path: Path to photo to verify
            threshold: Similarity threshold (YOUR value: 0.35)
            
        Returns:
            Tuple of (match_found: bool, student_info: dict, similarity_score: float)
        """
        try:
            # Get embedding for test photo (YOUR method)
            emb_new = self.get_embedding(photo_path)
            if emb_new is None:
                return False, None, 0.0
            
            # Load database (YOUR method)
            db = self.load_db()
            
            if not db:
                logger.warning("No registered faces in database")
                return False, None, 0.0
            
            # Find best match (YOUR EXACT logic)
            best_name = None
            best_roll = None
            best_email = None
            best_score = 0.0
            
            for key, data in db.items():
                # Handle both old format (just embedding) and new format (dict)
                if isinstance(data, dict):
                    emb_saved = data['embedding']
                    name = data.get('name', key)
                    email = data.get('email', '')
                    roll = data.get('roll_number', key)
                else:
                    # Old format from YOUR original face_test.py
                    emb_saved = data
                    name = key
                    email = ''
                    roll = key
                
                # Calculate similarity (YOUR method)
                score = self.cosine_similarity(emb_new, emb_saved)
                
                if score > best_score:
                    best_score = score
                    best_name = name
                    best_roll = roll
                    best_email = email
            
            logger.info(f"Similarity Score: {best_score:.4f}")
            
            # Check threshold (YOUR logic: 0.35)
            if best_score > threshold:
                logger.info(f"✅ Matched: {best_name}")
                return True, {
                    'name': best_name,
                    'roll_number': best_roll,
                    'email': best_email
                }, best_score
            else:
                logger.info("❌ Unknown face")
                return False, None, best_score
                
        except Exception as e:
            logger.error(f"Error verifying face: {str(e)}")
            return False, None, 0.0


# Singleton instance
_face_service_instance = None

def get_face_service() -> FaceRecognitionService:
    """Get or create face recognition service instance"""
    global _face_service_instance
    if _face_service_instance is None:
        _face_service_instance = FaceRecognitionService()
    return _face_service_instance