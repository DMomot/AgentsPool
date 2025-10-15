#!/usr/bin/env python3
"""
Quick test runner script
Usage:
  python run_tests.py                    # Test production
  python run_tests.py local              # Test local
  python run_tests.py http://custom:8000 # Test custom URL
"""
import sys
import os
import subprocess

def main():
    # Determine API URL
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "local":
            api_url = "http://localhost:8000"
        elif arg.startswith("http"):
            api_url = arg
        else:
            print(f"Unknown argument: {arg}")
            print(__doc__)
            sys.exit(1)
    else:
        # Default to production
        api_url = "https://agentspool.ai"
    
    print(f"🧪 Running tests against: {api_url}")
    print("=" * 60)
    
    # Set environment variable
    env = os.environ.copy()
    env["API_BASE_URL"] = api_url
    
    # Run pytest
    result = subprocess.run(
        ["pytest", "test_api.py", "-v", "--tb=short", "--color=yes"],
        env=env,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    print("=" * 60)
    if result.returncode == 0:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()

