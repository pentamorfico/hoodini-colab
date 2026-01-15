"""
Example: Using Hoodini Launcher in Google Colab
================================================

This example shows how to use hoodini-colab in Google Colab
or any Jupyter notebook environment.
"""

# Step 1: Install the package
# !pip install hoodini-colab

# Step 2: Import and create launcher
from hoodini_launcher import create_launcher

# Step 3: Display the interactive widget
launcher = create_launcher()
display(launcher)

# That's it! The launcher will:
# 1. Show an interactive UI for parameter configuration
# 2. Auto-install Hoodini if not present
# 3. Execute your analysis when you click "Run"

# Optional: Access the generated command programmatically
# print(f"Generated command: {launcher.command}")

# Optional: Monitor execution status
# def status_callback(change):
#     print(f"Status: {launcher.status_state}")
#     print(f"Message: {launcher.status_message}")
# 
# launcher.observe(status_callback, names=['status_state'])
