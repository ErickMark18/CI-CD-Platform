import pytest
import httpx
import subprocess
import time
import os


def docker_available():
    try:
        result = subprocess.run(["docker", "info"], capture_output=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False


@pytest.mark.skipif(not docker_available(), reason="Docker not available")
class TestRollback:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.image = os.getenv("IMAGE_TAG", "ci-cd-platform:test")
        self.host = os.getenv("DEPLOY_HOST", "localhost")
        self.port = os.getenv("DEPLOY_PORT", "8000")
        self.base_url = f"http://{self.host}:{self.port}"

    def get_current_image(self):
        result = subprocess.run(
            ["docker", "inspect", "app", "--format", "{{.Image}}"],
            capture_output=True, text=True
        )
        return result.stdout.strip()

    def get_previous_image(self):
        result = subprocess.run(
            ["docker", "inspect", "app", "--format", "{{.Image}}"],
            capture_output=True, text=True
        )
        return result.stdout.strip()

    def deploy_image(self, tag: str):
        subprocess.run(["docker", "stop", "app"], capture_output=True)
        subprocess.run(["docker", "rm", "app"], capture_output=True)
        subprocess.run(
            ["docker", "run", "-d", "--name", "app", "--restart", "unless-stopped",
             "-p", "8000:8000", tag],
            check=True
        )
        time.sleep(2)

    def test_healthcheck_before_rollback(self):
        response = httpx.get(f"{self.base_url}/health", timeout=10)
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_rollback_restores_previous_version(self):
        previous = self.get_previous_image()
        assert previous, "No previous image found"

        self.deploy_image(self.image)
        time.sleep(2)

        response = httpx.get(f"{self.base_url}/health", timeout=10)
        if response.status_code != 200:
            self.deploy_image(previous)
            time.sleep(2)
            restoreResponse = httpx.get(f"{self.base_url}/health", timeout=10)
            assert restoreResponse.status_code == 200, "Rollback failed to restore"
