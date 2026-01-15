.PHONY: help install dev-install clean lint format type-check test build publish

help:  ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install package
	pip install .

dev-install:  ## Install package with dev dependencies
	pip install -e ".[dev]"

clean:  ## Clean build artifacts
	rm -rf build/ dist/ *.egg-info .pytest_cache/ .mypy_cache/ .ruff_cache/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

lint:  ## Run linting checks
	ruff check src/

format:  ## Format code
	ruff format src/

format-check:  ## Check if code is formatted
	ruff format --check src/

type-check:  ## Run type checking
	mypy src/

test:  ## Run tests
	pytest

test-cov:  ## Run tests with coverage
	pytest --cov=hoodini_colab --cov-report=html --cov-report=term

build:  ## Build package
	python -m build

publish-test:  ## Publish to TestPyPI
	python -m twine upload --repository testpypi dist/*

publish:  ## Publish to PyPI
	python -m twine upload dist/*

all-checks: format lint type-check test  ## Run all checks

dev: dev-install all-checks  ## Setup dev environment and run checks
