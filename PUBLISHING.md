# Publishing to PyPI

## Prerequisites

1. Create accounts on:
   - [TestPyPI](https://test.pypi.org/account/register/) (for testing)
   - [PyPI](https://pypi.org/account/register/) (for production)

2. Install required tools:
   ```bash
   pip install build twine
   ```

3. Configure API tokens:
   - Create API tokens in your PyPI account settings
   - Store in `~/.pypirc`:
   ```ini
   [distutils]
   index-servers =
       pypi
       testpypi

   [pypi]
   username = __token__
   password = pypi-YOUR_API_TOKEN_HERE

   [testpypi]
   repository = https://test.pypi.org/legacy/
   username = __token__
   password = pypi-YOUR_TESTPYPI_TOKEN_HERE
   ```

## Publishing Steps

### 1. Update Version

Edit `pyproject.toml`:
```toml
version = "0.1.1"  # Bump version
```

### 2. Update CHANGELOG.md

Add release notes for the new version.

### 3. Clean Previous Builds

```bash
rm -rf dist/ build/ *.egg-info
```

### 4. Build Package

```bash
python -m build
```

This creates:
- `dist/hoodini_launcher-X.Y.Z.tar.gz` (source distribution)
- `dist/hoodini_launcher-X.Y.Z-py3-none-any.whl` (wheel)

### 5. Check Package

```bash
twine check dist/*
```

### 6. Test on TestPyPI (Recommended)

```bash
twine upload --repository testpypi dist/*
```

Install and test:
```bash
pip install --index-url https://test.pypi.org/simple/ hoodini-colab
```

### 7. Publish to PyPI

```bash
twine upload dist/*
```

### 8. Create Git Tag

```bash
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0
```

### 9. Create GitHub Release

Go to GitHub and create a release from the tag with CHANGELOG notes.

## Post-Publication

Verify installation:
```bash
pip install hoodini-colab
python -c "from hoodini_launcher import create_launcher; print('✅ Success')"
```

## Troubleshooting

### "File already exists"
- Version already published
- Bump version number and rebuild

### "Invalid package"
- Run `twine check dist/*` to see errors
- Check `MANIFEST.in` includes all necessary files

### "Module not found" after install
- Check `pyproject.toml` package configuration
- Verify `widget.js` is included in wheel

## Useful Commands

```bash
# Check what's in the package
tar -tzf dist/hoodini_launcher-0.1.0.tar.gz | head -20

# Check wheel contents
unzip -l dist/hoodini_launcher-0.1.0-py3-none-any.whl

# Install from local wheel
pip install dist/hoodini_launcher-0.1.0-py3-none-any.whl
```
