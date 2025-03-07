from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.database.database import engine, Base
from backend.routers import auth, users, trading

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zerodha Clone API",
    description="A FastAPI backend for a Zerodha-like trading platform",
    version="0.1.0"
)

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(trading.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Zerodha Clone API. Visit /docs for API documentation."}

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True) 