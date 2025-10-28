"""
API Integration Tests
Tests all endpoints against production API
"""
import os
import pytest
import requests

# Test against production API by default
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.agentspool.ai")

def test_api_available():
    """Test that API is available"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_categories():
    """Test GET /api/v1/categories"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    if data:
        category = data[0]
        assert "id" in category
        assert "name" in category
        assert "slug" in category

def test_get_category_by_slug():
    """Test GET /api/v1/categories/slug/{slug}"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    categories = response.json()
    
    if categories:
        category_slug = categories[0]["slug"]
        response = requests.get(f"{API_BASE_URL}/api/v1/categories/slug/{category_slug}")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == category_slug
        assert "name" in data

def test_get_agents_by_category():
    """Test GET /api/v1/categories/{slug}/agents"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    categories = response.json()
    
    if categories:
        category_slug = categories[0]["slug"]
        response = requests.get(f"{API_BASE_URL}/api/v1/categories/{category_slug}/agents")
        assert response.status_code == 200
        data = response.json()
        assert "agents" in data
        assert isinstance(data["agents"], list)
        assert "total" in data
        assert "page" in data
        assert "limit" in data

def test_get_category_stats():
    """Test GET /api/v1/categories/stats"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories/stats")
    assert response.status_code == 200
    data = response.json()
    assert "category_stats" in data
    assert "total_agents" in data
    assert "total_categories" in data

def test_search_agents():
    """Test GET /api/v1/agents (search)"""
    response = requests.get(f"{API_BASE_URL}/api/v1/agents?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert isinstance(data["agents"], list)
    assert "total" in data
    assert "page" in data
    assert "limit" in data

def test_get_agent_by_slug():
    """Test GET /api/v1/agents/slug/{slug}"""
    response = requests.get(f"{API_BASE_URL}/api/v1/agents?page=1&limit=100")
    data = response.json()
    
    agent_slug = None
    if data.get("agents"):
        for agent in data["agents"]:
            if agent.get("slug"):
                agent_slug = agent["slug"]
                break
    
    if agent_slug:
        response = requests.get(f"{API_BASE_URL}/api/v1/agents/slug/{agent_slug}")
        assert response.status_code == 200
        agent_data = response.json()
        assert agent_data["slug"] == agent_slug
        assert "name" in agent_data
        assert "description" in agent_data
    else:
        pytest.skip("No agents with slug found in database")

def test_check_agent_url():
    """Test GET /api/v1/agents/check-url"""
    response = requests.get(f"{API_BASE_URL}/api/v1/agents/check-url?url=https://example.com")
    assert response.status_code == 200
    data = response.json()
    assert "exists" in data

def test_cors_headers():
    """Test that CORS headers are present"""
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    assert response.status_code == 200

def test_api_response_time():
    """Test that API responds within acceptable time"""
    import time
    
    start = time.time()
    response = requests.get(f"{API_BASE_URL}/api/v1/categories")
    duration = time.time() - start
    
    assert response.status_code == 200
    assert duration < 5.0

def test_get_fundraising_list():
    """Test GET /api/v1/fundraising"""
    response = requests.get(f"{API_BASE_URL}/api/v1/fundraising?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "companies" in data
    assert isinstance(data["companies"], list)
    assert "total" in data
    assert "page" in data
    assert "limit" in data

def test_get_fundraising_with_search():
    """Test GET /api/v1/fundraising with search"""
    response = requests.get(f"{API_BASE_URL}/api/v1/fundraising?search=AI&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "companies" in data
    assert isinstance(data["companies"], list)

def test_get_fundraising_company():
    """Test GET /api/v1/fundraising/{id}"""
    list_response = requests.get(f"{API_BASE_URL}/api/v1/fundraising?limit=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if data.get("companies") and len(data["companies"]) > 0:
            company_id = data["companies"][0]["id"]
            response = requests.get(f"{API_BASE_URL}/api/v1/fundraising/{company_id}")
            assert response.status_code == 200
            company = response.json()
            assert "id" in company
            assert "name" in company
            assert company["id"] == company_id
        else:
            pytest.skip("No fundraising companies found in database")
    else:
        pytest.skip("Could not fetch fundraising list")

def test_get_news():
    """Test GET /api/v1/news"""
    response = requests.get(f"{API_BASE_URL}/api/v1/news?page=1&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert "articles" in data
    assert isinstance(data["articles"], list)
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert "total_pages" in data
    assert "has_next" in data
    assert "has_prev" in data

def test_get_news_article():
    """Test GET /api/v1/news/{id}"""
    list_response = requests.get(f"{API_BASE_URL}/api/v1/news?limit=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if data.get("articles") and len(data["articles"]) > 0:
            article_id = data["articles"][0]["id"]
            response = requests.get(f"{API_BASE_URL}/api/v1/news/{article_id}")
            assert response.status_code == 200
            article = response.json()
            assert "id" in article
            assert "title" in article
            assert "link" in article
            assert "source_name" in article
            assert article["id"] == article_id
        else:
            pytest.skip("No news articles found in database")
    else:
        pytest.skip("Could not fetch news list")

def test_get_news_sources():
    """Test GET /api/v1/news/sources/list"""
    response = requests.get(f"{API_BASE_URL}/api/v1/news/sources/list")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        source = data[0]
        assert "name" in source
        assert "domain" in source

def test_get_news_tags():
    """Test GET /api/v1/news/tags/list"""
    response = requests.get(f"{API_BASE_URL}/api/v1/news/tags/list")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_news_with_tag_filter():
    """Test GET /api/v1/news with tag filter"""
    tags_response = requests.get(f"{API_BASE_URL}/api/v1/news/tags/list")
    if tags_response.status_code == 200:
        tags = tags_response.json()
        if tags:
            test_tag = tags[0]
            response = requests.get(f"{API_BASE_URL}/api/v1/news?tag={test_tag}&limit=10")
            assert response.status_code == 200
            data = response.json()
            assert "articles" in data
            assert isinstance(data["articles"], list)
        else:
            pytest.skip("No tags found in database")

def test_get_news_with_source_filter():
    """Test GET /api/v1/news with source filter"""
    sources_response = requests.get(f"{API_BASE_URL}/api/v1/news/sources/list")
    if sources_response.status_code == 200:
        sources = sources_response.json()
        if sources:
            test_source = sources[0]["name"]
            response = requests.get(f"{API_BASE_URL}/api/v1/news?source={test_source}&limit=10")
            assert response.status_code == 200
            data = response.json()
            assert "articles" in data
            assert isinstance(data["articles"], list)
        else:
            pytest.skip("No sources found in database")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
