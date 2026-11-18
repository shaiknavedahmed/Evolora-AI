"""
Application configuration — all settings from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import Optional, Union, Any
import json


class Settings(BaseSettings):
    """Central configuration loaded from .env file or environment variables."""

    # App
    APP_NAME: str = "Evolora API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: Union[list[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @property
    def cors_origins(self) -> list[str]:
        """Normalize ALLOWED_ORIGINS whether passed as list, JSON string, or comma-separated string."""
        v = self.ALLOWED_ORIGINS
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return list(v)

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "Evolora"

    # Auth / JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── AI Provider (Anthropic Claude, via OpenAI-compatible endpoint) ──────────
    # Evolora talks to Claude through Anthropic's OpenAI-compatible chat
    # completions API, so the existing OpenAI-style client code is reused as-is;
    # switching providers stays a config change.
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.anthropic.com/v1/"
    AI_TIMEOUT_SECONDS: float = 60.0
    AI_MAX_RETRIES: int = 2
    AI_MAX_OUTPUT_TOKENS: int = 8192

    # Per-task model selection. Cheap model for classification/extraction,
    # stronger model for generation, strongest for evaluation (the product's IP).
    # NOTE: confirm the exact current Claude model IDs on Anthropic's pricing/models
    # page before deploying — these are the documented families, VERIFY the strings.
    AI_MODEL_EXTRACTION: str = "claude-haiku-4-5"   # VERIFY: JD extraction, classification, tagging
    AI_MODEL_GENERATION: str = "claude-sonnet-4-5"  # VERIFY: questions, interview turns, resume
    AI_MODEL_EVALUATION: str = "claude-sonnet-4-5"  # VERIFY: scoring/feedback; bump to Opus if tests show drift
    # Default model used when a call site does not specify a task tier.
    AI_MODEL_DEFAULT: str = "claude-sonnet-4-5"     # VERIFY

    # ── Backward-compatible aliases (deprecated NVIDIA_* names) ─────────────────
    # Kept so any un-migrated reference or .env still resolves. Prefer AI_* above.
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = ""
    NVIDIA_MODEL: str = ""
    NVIDIA_TIMEOUT_SECONDS: float = 0.0
    NVIDIA_MAX_RETRIES: int = 0
    NVIDIA_MAX_OUTPUT_TOKENS: int = 0

    @property
    def ai_api_key(self) -> str:
        return self.AI_API_KEY or self.NVIDIA_API_KEY

    @property
    def ai_base_url(self) -> str:
        return self.AI_BASE_URL or self.NVIDIA_BASE_URL or "https://api.anthropic.com/v1/"

    @property
    def ai_default_model(self) -> str:
        return self.AI_MODEL_DEFAULT or self.NVIDIA_MODEL or "claude-sonnet-4-5"

    @property
    def ai_timeout_seconds(self) -> float:
        return self.AI_TIMEOUT_SECONDS or self.NVIDIA_TIMEOUT_SECONDS or 60.0

    @property
    def ai_max_retries(self) -> int:
        return self.AI_MAX_RETRIES if self.AI_MAX_RETRIES else (self.NVIDIA_MAX_RETRIES or 2)

    @property
    def ai_max_output_tokens(self) -> int:
        return self.AI_MAX_OUTPUT_TOKENS or self.NVIDIA_MAX_OUTPUT_TOKENS or 8192

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    LLM_CALLS_PER_USER_PER_DAY: int = 50

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
