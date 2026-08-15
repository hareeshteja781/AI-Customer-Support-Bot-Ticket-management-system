from pathlib import Path


def test_backend_environment_template_is_safe_and_configurable():
    env_path = Path(__file__).resolve().parents[1] / ".env.example"
    env_text = env_path.read_text()
    assert "DATABASE_URL=" not in env_text or "postgresql+psycopg" in env_text
    assert "JWT_SECRET_KEY=replace-with-a-long-random-secret" in env_text
