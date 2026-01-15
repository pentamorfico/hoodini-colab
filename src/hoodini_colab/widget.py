"""Hoodini Launcher widget - Interactive parameter configurator for Hoodini CLI."""

import os
import subprocess
from pathlib import Path

import anywidget
import traitlets


class HoodiniLauncher(anywidget.AnyWidget):
    """Interactive Hoodini CLI launcher widget with Sidebar and Modes.

    This widget provides an interactive interface for configuring and launching
    Hoodini genomic neighborhood analysis with various input modes:
    - Single Input: Single protein ID or FASTA
    - Input List: Multiple IDs or files
    - Input Sheet: Tabular data with multiple columns

    Attributes:
        command: The generated command line string.
        run_requested: Trigger for running the command.
        status_state: Current status (idle, installing, running, finished, error).
        status_message: Status message to display.
    """

    _esm = (Path(__file__).parent / "widget.js").read_text()

    command = traitlets.Unicode("hoodini run").tag(sync=True)
    run_requested = traitlets.Bool(False).tag(sync=True)
    status_state = traitlets.Unicode("idle").tag(sync=True)
    status_message = traitlets.Unicode("").tag(sync=True)
    mount_gdrive = traitlets.Bool(False).tag(sync=True)
    html_output = traitlets.Unicode("").tag(sync=True)


def create_launcher() -> HoodiniLauncher:
    """Create and configure a HoodiniLauncher widget with execution handler.

    This function sets up the launcher widget and attaches the execution handler
    that manages installation checks and command execution.

    Returns:
        HoodiniLauncher: Configured launcher widget ready to be displayed.

    Example:
        >>> from hoodini_colab import create_launcher
        >>> launcher = create_launcher()
        >>> display(launcher)
    """
    from hoodini_colab.utils import (
        check_hoodini_installed,
        check_launcher_packages,
        install_hoodini,
        install_launcher_packages,
    )

    def run_hoodini(change):
        """Run hoodini when button is clicked."""
        if launcher.run_requested:
            launcher.run_requested = False
            launcher.status_state = "idle"

            try:
                # Mount Google Drive if requested
                gdrive_mount_path = None
                if launcher.mount_gdrive:
                    launcher.status_state = "installing_launcher"
                    launcher.status_message = "Mounting Google Drive..."
                    print("🔍 Mounting Google Drive...")
                    try:
                        from google.colab import drive
                        gdrive_mount_path = '/content/drive'
                        drive.mount(gdrive_mount_path)
                        print("✅ Google Drive mounted successfully at /content/drive/My Drive\n")
                    except ImportError:
                        print("⚠️  Google Drive mount only available in Google Colab. Skipping...\n")
                        gdrive_mount_path = None
                    except Exception as e:
                        print(f"⚠️  Could not mount Google Drive: {e}\n")
                        gdrive_mount_path = None

                # First, check if launcher packages are installed
                if not check_launcher_packages():
                    launcher.status_state = "installing_launcher"
                    launcher.status_message = "Installing launcher dependencies..."
                    print("🔍 Launcher dependencies not found. Installing...")
                    if not install_launcher_packages():
                        print("\n❌ Failed to install launcher dependencies.")
                        launcher.status_state = "error"
                        launcher.status_message = "Failed to install launcher dependencies"
                        return
                else:
                    print("✅ Launcher dependencies are already installed\n")

                # Check if hoodini is installed
                if not check_hoodini_installed():
                    launcher.status_state = "installing_hoodini"
                    launcher.status_message = "Installing Hoodini and downloading databases..."
                    print("🔍 Hoodini not found in PATH. Installing...")
                    # Pass the command so we can determine which databases to download
                    if not install_hoodini(launcher.command, launcher):
                        print("\n❌ Installation failed. Please check the errors above.")
                        launcher.status_state = "error"
                        launcher.status_message = "Hoodini installation failed"
                        return
                else:
                    print("✅ Hoodini is already installed\n")

                # Run the command
                launcher.status_state = "running"
                launcher.status_message = "Executing Hoodini analysis..."

                cmd = launcher.command
                print(f"🚀 Running: {cmd}\n")
                print("=" * 60 + "\n")

                # If we installed via pixi, use pixi run
                hoodini_env_path = (
                    Path("/content/hoodini_env")
                    if Path("/content/hoodini_env").exists()
                    else Path.home() / "hoodini_env"
                )
                if hoodini_env_path.exists():
                    # Change to hoodini_env directory to run pixi commands
                    original_dir = Path.cwd()
                    os.chdir(hoodini_env_path)
                    cmd = cmd.replace("hoodini ", "pixi run hoodini ")

                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                )
                for line in process.stdout:
                    print(line, end="")
                process.wait()

                if process.returncode == 0:
                    print("\n" + "=" * 60)
                    print("✅ Hoodini analysis completed successfully!")
                    print("=" * 60)
                    
                    # Try to read the HTML visualization
                    output_folder = launcher.command.split('--output ')[-1].split()[0] if '--output' in launcher.command else 'results'
                    html_path = Path(output_folder) / 'hoodini-viz' / 'hoodini-viz.html'
                    
                    if html_path.exists():
                        try:
                            with open(html_path, 'r') as f:
                                html_content = f.read()
                            launcher.html_output = html_content
                            print(f"📊 Interactive visualization ready: {html_path}\n")
                        except Exception as e:
                            print(f"⚠️  Could not read HTML visualization: {e}\n")
                    else:
                        print(f"ℹ️  HTML visualization not found at {html_path}\n")
                    
                    launcher.status_state = "finished"
                    launcher.status_message = "Analysis completed successfully!"
                else:
                    print(f"\n❌ Process exited with code: {process.returncode}")
                    launcher.status_state = "error"
                    launcher.status_message = f"Process failed with exit code {process.returncode}"

                # Restore original directory if we changed it
                if hoodini_env_path.exists() and "original_dir" in locals():
                    os.chdir(original_dir)
            except Exception as e:
                print(f"❌ Error: {e}")
                launcher.status_state = "error"
                launcher.status_message = str(e)

    launcher = HoodiniLauncher()
    launcher.observe(run_hoodini, names=["run_requested"])
    return launcher
