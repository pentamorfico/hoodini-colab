# GitHub Repository Setup

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `hoodini-colab`
3. Choose `Public` (for the Colab button to work)
4. Don't initialize with README (we already have one)

## Step 2: Push Your Code

```bash
cd /home/pentamorfico/software/hoodini-colab

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Hoodini Launcher v0.1.0"

# Add remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/hoodini-colab.git

# Push
git branch -M main
git push -u origin main
```

## Step 3: Update Colab Badge URL

Once you know your GitHub username and repository name, update the Colab badge URL in:

1. **README.md** (line 7 and line 13):
   ```markdown
   [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/YOUR_USERNAME/hoodini-colab/blob/main/hoodini_launcher.ipynb)
   ```

2. **hoodini_launcher.ipynb** (first cell):
   Same badge URL as above

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Test the Colab Button

1. Go to your GitHub repository
2. Click the "Open in Colab" badge in the README
3. It should open the notebook in Google Colab
4. Run the cells to test!

## Example Working URLs

If your repository is at `https://github.com/john/hoodini-colab`, the Colab URL would be:
```
https://colab.research.google.com/github/john/hoodini-colab/blob/main/hoodini_launcher.ipynb
```

## Notes

- The repository must be **public** for the Colab badge to work
- The notebook file must be in the root directory or adjust the path in the URL
- GitHub renders the badge automatically in the README

## Bonus: Add to PyPI

Once published on PyPI, users can simply:

```python
!pip install hoodini-colab
```

And the notebook will work immediately in any Colab or Jupyter environment!
