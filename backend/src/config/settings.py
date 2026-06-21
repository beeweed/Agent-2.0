from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "E2B Native Tool Agent"
    environment: str = "development"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    nvidia_nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    sandbox_timeout_seconds: int = 3600
    max_iterations: int = 1000
    cors_allow_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
