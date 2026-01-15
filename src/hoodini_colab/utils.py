"""Utility functions for hoodini installation and package management."""

import os
import subprocess
import sys
from pathlib import Path


def check_launcher_packages() -> bool:
    """Check if launcher dependencies are installed.

    Returns:
        bool: True if all dependencies are installed, False otherwise.
    """
    try:
        import anywidget  # noqa: F401
        import traitlets  # noqa: F401

        return True
    except ImportError:
        return False


def install_launcher_packages() -> bool:
    """Install launcher dependencies.

    Returns:
        bool: True if installation succeeded, False otherwise.
    """
    print("\n" + "=" * 60)
    print("📦 Installing launcher dependencies...")
    print("=" * 60 + "\n")

    packages = ["anywidget", "traitlets", "ipywidgets"]

    for pkg in packages:
        print(f"Installing {pkg}...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", pkg],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"❌ Failed to install {pkg}")
            print(result.stderr)
            return False
        print(f"✅ {pkg} installed successfully")

    print("\n" + "=" * 60)
    print("✅ Launcher dependencies installed successfully!")
    print("=" * 60 + "\n")
    return True


def check_hoodini_installed() -> bool:
    """Check if hoodini is available in PATH.

    Returns:
        bool: True if hoodini is installed, False otherwise.
    """
    result = subprocess.run(["which", "hoodini"], capture_output=True, text=True)
    return result.returncode == 0


def run_cmd(cmd: str, shell: bool = True) -> int:
    """Run command and stream output.

    Args:
        cmd: Command to run.
        shell: Whether to run command in shell.

    Returns:
        int: Return code of the command.
    """
    process = subprocess.Popen(
        cmd, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
    )
    for line in iter(process.stdout.readline, ""):
        print(line, end="")
    process.wait()
    return process.returncode


def install_hoodini(command: str = "", launcher=None) -> bool:
    """Install pixi and hoodini environment.

    Args:
        command: The hoodini command to be executed, used to determine which databases to download.
        launcher: Optional HoodiniLauncher widget to update status.

    Returns:
        bool: True if installation succeeded, False otherwise.
    """
    # Setup environment - use /content for Colab compatibility
    if Path("/content").exists():
        workdir = Path("/content/hoodini_env")
    else:
        workdir = Path.home() / "hoodini_env"

    workdir.mkdir(parents=True, exist_ok=True)
    os.chdir(workdir)
    os.environ["PATH"] = str(Path.home() / ".pixi" / "bin") + ":" + os.environ["PATH"]

    # Install pixi
    print("\n=== Installing pixi ===\n")
    if run_cmd("curl -fsSL https://pixi.sh/install.sh | bash") != 0:
        print("❌ Failed to install pixi")
        return False

    # Download environment.yml
    print("\n=== Downloading environment.yml ===\n")
    if run_cmd("wget -O environment.yml https://storage.hoodini.bio/environment.yml") != 0:
        print("❌ Failed to download environment.yml")
        return False

    # Initialize pixi environment
    print("\n=== Initializing pixi environment ===\n")
    if run_cmd("pixi init --import environment.yml") != 0:
        print("❌ Failed to initialize pixi")
        return False

    # Install dependencies
    print("\n=== Installing dependencies (this may take a while) ===\n")
    if run_cmd("pixi install") != 0:
        print("❌ Failed to install dependencies")
        return False

    # Download databases
    if launcher:
        launcher.status_state = "downloading_databases"
        launcher.status_message = "Downloading reference databases (this may take 5-10 minutes)..."
    print("\n=== Downloading Hoodini databases ===\n")

    # Build download command based on what's needed
    download_flags = ["--force"]  # Always force download

    # Check which tools are NOT in the command and skip their databases
    if "--padloc" not in command:
        download_flags.append("--skip-padloc")
    if "--deffinder" not in command:
        download_flags.append("--skip-deffinder")
    if "--genomad" not in command:
        download_flags.append("--skip-genomad")

    # Always skip emapper for now (too large)
    download_flags.append("--skip-emapper")
    download_flags.append("--skip-parquet")

    download_cmd = f"pixi run hoodini download databases {' '.join(download_flags)}"
    print(f"Running: {download_cmd}\n")

    if run_cmd(download_cmd) != 0:
        print("❌ Failed to download databases")
        return False

    print("\n=== Downloading assembly_summary ===\n")
    if run_cmd("pixi run hoodini download assembly_summary") != 0:
        print("❌ Failed to download assembly_summary")
        return False

    print("\n" + "=" * 60)
    print("✅ Hoodini installation completed successfully!")
    print("=" * 60 + "\n")
    return True
