# Contributing to hoodini-colab

Thank you for your interest in contributing to hoodini-colab! 🎉

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hoodini-colab.git
   cd hoodini-colab
   ```

2. **Install in development mode**
   ```bash
   pip install -e ".[dev]"
   ```

3. **Install pre-commit hooks** (optional but recommended)
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the code

3. Format and lint your code
   ```bash
   make format
   make lint
   ```

4. Test your changes
   ```bash
   # Import test
   python -c "from hoodini_launcher import create_launcher"
   
   # Test in a notebook
   jupyter notebook hoodini_launcher.ipynb
   ```

5. Commit your changes
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- We use [Ruff](https://docs.astral.sh/ruff/) for linting and formatting
- Line length: 100 characters
- Follow PEP 8 guidelines
- Use type hints where possible

Run formatting:
```bash
ruff format src/
```

Run linting:
```bash
ruff check src/
```

### Project Structure

```
hoodini-colab/
├── src/hoodini_launcher/    # Main package
│   ├── __init__.py           # Package exports
│   ├── widget.py             # Widget class and logic
│   ├── widget.js             # Frontend JavaScript
│   └── utils.py              # Utility functions
├── examples/                 # Usage examples
├── .github/workflows/        # CI/CD configuration
├── pyproject.toml            # Package configuration
├── README.md                 # Project documentation
├── CHANGELOG.md              # Version history
└── Makefile                  # Development tasks
```

## Testing

Currently, we test via manual import and widget creation. In the future, we'll add:
- Unit tests with pytest
- Integration tests
- Widget rendering tests

## Pull Request Process

1. Update documentation if needed
2. Update CHANGELOG.md with your changes
3. Ensure all checks pass (lint, format, import test)
4. Submit a pull request with a clear description
5. Wait for review and address feedback

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the code
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for making hoodini-colab better! 🚀
