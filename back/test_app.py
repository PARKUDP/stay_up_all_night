import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_get_message(client):
    rv = client.get('/api/message')
    assert rv.status_code == 200
    assert rv.get_json() == {"message": "Hello World!"}
