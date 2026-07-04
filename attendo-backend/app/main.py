from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.routers import auth, subjects, attendance
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Attendo API",
    description="Smart Attendance Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for photos
if os.path.exists("photos"):
    app.mount("/photos", StaticFiles(directory="photos"), name="photos")

# Include routers
app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(attendance.router)  

@app.get("/")
async def root():
    return {
        "message": "Welcome to Attendo API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)