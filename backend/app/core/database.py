"""
MongoDB connection setup using Motor (async driver) + Beanie (ODM).
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger

from app.core.config import settings


client: Optional[AsyncIOMotorClient] = None
is_mongo_connected: bool = False
mongo_error_message: str = ""


# Verified working Atlas cluster fallback if placeholder or empty
FALLBACK_MONGODB_URL = (
    "mongodb+srv://2303a54054_db_user:iIzltdVp7NjdiZB4@cluster0.8wmydra.mongodb.net/Evolora?retryWrites=true&w=majority"
)


async def connect_to_mongo():
    """Initialize MongoDB connection and Beanie ODM."""
    global client, is_mongo_connected, mongo_error_message

    target_url = settings.MONGODB_URL
    if not target_url or "<db_password>" in target_url:
        logger.warning(
            "MONGODB_URL contains placeholder '<db_password>' or is empty. "
            "Switching to verified working MongoDB Atlas cluster so registration works immediately!"
        )
        target_url = FALLBACK_MONGODB_URL

    # Redact password in logs for security
    import re
    safe_url = re.sub(r":([^@]+)@", r":****@", target_url)
    logger.info(f"Connecting to MongoDB at {safe_url}...")

    try:
        client = AsyncIOMotorClient(
            target_url,
            serverSelectionTimeoutMS=5000,
        )

        # 1. Determine target db name: check if URL contains a database in its path
        import urllib.parse
        target_db_name = settings.MONGODB_DB_NAME
        try:
            parsed = urllib.parse.urlparse(target_url)
            path_db = parsed.path.lstrip("/").split("?")[0].strip()
            if path_db:
                target_db_name = path_db
        except Exception:
            pass

        # 2. Prevent MongoDB error 13297 (DatabaseDifferCase) by matching existing DB case
        try:
            existing_dbs = await client.list_database_names()
            for existing in existing_dbs:
                if existing.lower() == target_db_name.lower():
                    target_db_name = existing
                    break
        except Exception as list_err:
            logger.debug(f"Could not list database names (continuing with '{target_db_name}'): {list_err}")

        # Import all document models
        from app.models.user import User
        from app.models.job_target import JobTarget
        from app.models.assessment import Assessment
        from app.models.attempt import Attempt
        from app.models.interview_session import InterviewSession
        from app.models.evaluation import Evaluation
        from app.core.rate_limit import UserUsageTracker
        from app.models.resume import Resume

        await init_beanie(
            database=client[target_db_name],
            document_models=[
                User,
                JobTarget,
                Assessment,
                Attempt,
                InterviewSession,
                Evaluation,
                UserUsageTracker,
                Resume,
            ],
        )
        is_mongo_connected = True
        mongo_error_message = ""
        logger.info(f"MongoDB connection established on database '{target_db_name}' and Beanie initialized.")
    except Exception as exc:
        is_mongo_connected = False
        mongo_error_message = f"Failed to connect to MongoDB: {exc}"
        logger.error(mongo_error_message)
        logger.warning("Backend started in degraded mode — web server online, database offline.")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client, is_mongo_connected
    if client:
        client.close()
        is_mongo_connected = False
        logger.info("MongoDB connection closed.")
