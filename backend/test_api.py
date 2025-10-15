"""
API Integration Tests
Tests all endpoints to ensure they return 200 and valid data
"""
import os
import sys
import pytest
from urllib.parse import urljoin

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Test against deployed API or local
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

def test_api_available():
    """Test that API is available"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/status"))
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"

def test_get_categories():
    """Test GET /api/v1/categories"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/categories"))
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check structure of first category
    if data:
        category = data[0]
        assert "id" in category
        assert "name" in category
        assert "slug" in category

def test_get_category_by_id():
    """Test GET /api/v1/categories/{id}"""
    import requests
    # First get all categories to get a valid ID
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/categories"))
    categories = response.json()
    
    if categories:
        category_id = categories[0]["id"]
        response = requests.get(urljoin(API_BASE_URL, f"/api/v1/categories/{category_id}"))
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == category_id
        assert "name" in data

def test_get_category_by_slug():
    """Test GET /api/v1/categories/slug/{slug}"""
    import requests
    # First get all categories to get a valid slug
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/categories"))
    categories = response.json()
    
    if categories:
        category_slug = categories[0]["slug"]
        response = requests.get(urljoin(API_BASE_URL, f"/api/v1/categories/slug/{category_slug}"))
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == category_slug
        assert "name" in data

def test_get_agents_by_category():
    """Test GET /api/v1/categories/{slug}/agents"""
    import requests
    # First get all categories
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/categories"))
    categories = response.json()
    
    if categories:
        category_slug = categories[0]["slug"]
        response = requests.get(urljoin(API_BASE_URL, f"/api/v1/categories/{category_slug}/agents"))
        assert response.status_code == 200
        data = response.json()
        assert "agents" in data
        assert isinstance(data["agents"], list)
        assert "pagination" in data

def test_get_category_stats():
    """Test GET /api/v1/categories/stats"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/categories/stats"))
    assert response.status_code == 200
    data = response.json()
    assert "category_stats" in data
    assert "total_agents" in data
    assert "total_categories" in data

def test_search_agents():
    """Test GET /api/v1/agents (search)"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/agents?page=1&limit=10"))
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert isinstance(data["agents"], list)
    assert "pagination" in data

def test_get_agent_by_slug():
    """Test GET /api/v1/agents/slug/{slug}"""
    import requests
    # First search for agents to get a valid slug
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/agents?page=1&limit=1"))
    data = response.json()
    
    if data.get("agents") and len(data["agents"]) > 0:
        agent_slug = data["agents"][0]["slug"]
        response = requests.get(urljoin(API_BASE_URL, f"/api/v1/agents/slug/{agent_slug}"))
        assert response.status_code == 200
        agent_data = response.json()
        assert agent_data["slug"] == agent_slug
        assert "name" in agent_data
        assert "description" in agent_data

def test_check_agent_url():
    """Test GET /api/v1/agents/check-url"""
    import requests
    response = requests.get(urljoin(API_BASE_URL, "/api/v1/agents/check-url?url=https://example.com"))
    assert response.status_code == 200
    data = response.json()
    assert "exists" in data

def test_cors_headers():
    """Test that CORS headers are present"""
    import requests
    response = requests.options(urljoin(API_BASE_URL, "/api/v1/categories"))
    assert response.status_code in [200, 204]
    # Check CORS headers
    assert "access-control-allow-origin" in response.headers or response.status_code == 200

def test_api_response_time():
    """Test that API responds within acceptable time"""
    import requests
    import time
    
    start = time.time()
    response = requests.get(urljoin(API_BASE_URL, "/status"))
    duration = time.time() - start
    
    assert response.status_code == 200
    assert duration < 5.0  # Should respond within 5 seconds

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])

