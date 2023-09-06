from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.api import ses_templates
import logging
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv


# Setting up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("log/app.log"), logging.StreamHandler()],
)

logger = logging.getLogger(__name__)
app = FastAPI()
load_dotenv()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="frontend"), name="frontend")

# Include API routes
app.include_router(ses_templates.router, prefix="/ses")


@app.get("/")
def serve_root():
    return FileResponse("frontend/index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True
    )
