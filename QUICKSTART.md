# hoodini-colab - Quick Reference

## Installation

```bash
pip install hoodini-colab
```

## Basic Usage

```python
from hoodini_colab import create_launcher

launcher = create_launcher()
display(launcher)
```

## Package Publishing

### TestPyPI (for testing)
```bash
python -m build
python -m twine upload --repository testpypi dist/*
```

### PyPI (production)
```bash
python -m build
python -m twine upload dist/*
```

## Development Commands

```bash
# Install in dev mode
pip install -e ".[dev]"

# Format code
ruff format src/

# Lint code
ruff check src/

# Type check
mypy src/

# Build package
python -m build

# Run all checks
make all-checks
```

## Project Structure

- `src/hoodini_colab/` - Main package source
  - `__init__.py` - Package exports
  - `widget.py` - Python widget class
  - `widget.js` - JavaScript frontend (46KB)
  - `utils.py` - Installation utilities
- `pyproject.toml` - Modern packaging configuration
- `Makefile` - Development shortcuts
- `examples/` - Usage examples
- `.github/workflows/` - CI/CD automation

## Features

✅ Three input modes (Single, List, Sheet)
✅ Full Hoodini CLI parameter coverage
✅ Auto-installation with pixi
✅ Modern, responsive UI
✅ Google Colab compatible
✅ Type hints and linting
✅ Comprehensive documentation

## Package Info

- Name: `hoodini-colab`
- Version: 0.1.0
- License: MIT
- Python: >=3.9
- Dependencies: anywidget, traitlets, ipython
