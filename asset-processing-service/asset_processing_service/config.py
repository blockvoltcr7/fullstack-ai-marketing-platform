"""
This module handles configuration settings for the asset processing service.

It loads environment variables, defines a Config class with various settings,
and provides utility functions for retrieving required environment variables.

The configuration includes settings for API communication, job processing,
and OpenAI model selection.
"""

import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def get_required_env(key: str) -> str:
    """
    Retrieve a required environment variable.

    Args:
        key (str): The name of the environment variable.

    Returns:
        str: The value of the environment variable.

    Raises:
        ValueError: If the environment variable is not set.
    """
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Missing required environment variable: {key}")
    return value.strip().strip("'\"")


class Config:
    """
    Configuration class containing various settings for the asset processing service.

    Attributes:
        API_BASE_URL (str): Base URL for API communication.
        SERVER_API_KEY (str): API key for server authentication.
        STUCK_JOB_THRESHOLD_SECONDS (int): Threshold for considering a job as stuck.
        MAX_JOB_ATTEMPTS (int): Maximum number of attempts for processing a job.
        MAX_NUM_WORKERS (int): Maximum number of concurrent workers.
        HEARTBEAT_INTERVAL_SECONDS (int): Interval for sending job heartbeats.
        MAX_CHUNK_SIZE_BYTES (int): Maximum size of audio chunks in bytes.
        OPENAI_MODEL (str): OpenAI model to use for processing.
    """

    # Use a single environment variable to determine the mode
    IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

    # Base configuration
    API_BASE_URL = os.getenv(
        "API_BASE_URL",
        (
            "https://fullstack-ai-marketing-platform-bice.vercel.app/"
            if IS_PRODUCTION
            else "http://localhost:3000/api"
        ),
    )
    SERVER_API_KEY = get_required_env("SERVER_API_KEY")
    STUCK_JOB_THRESHOLD_SECONDS = int(os.getenv("STUCK_JOB_THRESHOLD_SECONDS", "30"))
    MAX_JOB_ATTEMPTS = int(os.getenv("MAX_JOB_ATTEMPTS", "3"))
    MAX_NUM_WORKERS = int(os.getenv("MAX_NUM_WORKERS", "2"))
    HEARTBEAT_INTERVAL_SECONDS = int(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "10"))
    MAX_CHUNK_SIZE_BYTES = int(os.getenv("MAX_CHUNK_SIZE_BYTES", str(24 * 1024 * 1024)))
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "whisper-1")


# Create a global config instance
config = Config()

# Define headers for API requests
HEADERS = {"Authorization": f"Bearer {config.SERVER_API_KEY}"}
