#!/usr/bin/env python3
"""
Quick health check script
Быстро проверяет основные эндпоинты API
"""
import requests
import sys
from urllib.parse import urljoin

def check_endpoint(base_url, endpoint, description):
    """Check single endpoint"""
    url = urljoin(base_url, endpoint)
    try:
        response = requests.get(url, timeout=10)
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} {description}: {response.status_code} ({url})")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ {description}: ERROR - {str(e)}")
        return False

def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "https://agentspool.ai"
    
    print(f"🔍 Quick API Check: {base_url}")
    print("=" * 70)
    
    checks = [
        ("/status", "Health Check"),
        ("/api/v1/categories", "Categories List"),
        ("/api/v1/categories/stats", "Category Stats"),
        ("/api/v1/agents?page=1&limit=5", "Agents Search"),
    ]
    
    passed = 0
    total = len(checks)
    
    for endpoint, description in checks:
        if check_endpoint(base_url, endpoint, description):
            passed += 1
    
    print("=" * 70)
    print(f"Results: {passed}/{total} passed")
    
    if passed == total:
        print("✅ All checks passed!")
        sys.exit(0)
    else:
        print(f"❌ {total - passed} check(s) failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

