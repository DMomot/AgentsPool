.PHONY: help test test-local check check-local install

help:
	@echo "AgentsPool Backend - Available commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make check        - Quick health check (production)"
	@echo "  make check-local  - Quick health check (local)"
	@echo "  make test         - Run full test suite (production)"
	@echo "  make test-local   - Run full test suite (local)"
	@echo "  make run          - Start development server"
	@echo ""

install:
	pip install -r requirements.txt

check:
	python quick_check.py https://agentspool.ai

check-local:
	python quick_check.py http://localhost:8000

test:
	python run_tests.py

test-local:
	python run_tests.py local

run:
	python main.py

