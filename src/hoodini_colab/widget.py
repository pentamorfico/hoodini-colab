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
    input_list = traitlets.Unicode("").tag(sync=True)
    logs = traitlets.Unicode("").tag(sync=True)

    def keep_alive(self):
        """Keep the notebook cell running to prevent Colab disconnection.
        
        Call this after display(launcher) to keep the cell active while
        you interact with the widget. This prevents Google Colab from
        disconnecting when you switch tabs.
        
        Example:
            >>> launcher = create_launcher()
            >>> display(launcher)
            >>> launcher.keep_alive()  # Keeps cell running
        """
        import time
        print("\n⏳ Launcher is active - cell will keep running to prevent disconnection")
        print("   You can stop the cell manually when done using the stop button (⬛)")
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            print("\n✅ Cell stopped by user")


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

            # Reset logs for a fresh run
            launcher.logs = ""

            def append_log(text: str):
                """Append text to the synced logs."""
                launcher.logs = (launcher.logs or "") + text

            try:
                # Mount Google Drive if requested
                gdrive_mount_path = None
                if launcher.mount_gdrive:
                    launcher.status_state = "installing_launcher"
                    launcher.status_message = "Mounting Google Drive..."
                    append_log("🔍 Mounting Google Drive...\n")
                    try:
                        from google.colab import drive
                        gdrive_mount_path = '/content/drive'
                        drive.mount(gdrive_mount_path)
                        append_log("✅ Google Drive mounted successfully at /content/drive/MyDrive\n\n")
                        launcher.status_state = "idle"
                        launcher.status_message = ""
                    except ImportError:
                        append_log("⚠️  Google Drive mount only available in Google Colab. Skipping...\n\n")
                        gdrive_mount_path = None
                    except Exception as e:
                        append_log(f"⚠️  Could not mount Google Drive: {e}\n\n")
                        gdrive_mount_path = None

                # First, check if launcher packages are installed
                if not check_launcher_packages():
                    launcher.status_state = "installing_launcher"
                    launcher.status_message = "Installing launcher dependencies..."
                    append_log("🔍 Launcher dependencies not found. Installing...\n")
                    if not install_launcher_packages():
                        append_log("❌ Failed to install launcher dependencies.\n")
                        launcher.status_state = "error"
                        launcher.status_message = "Failed to install launcher dependencies"
                        return
                else:
                    append_log("✅ Launcher dependencies are already installed\n\n")

                # Check if hoodini is installed
                if not check_hoodini_installed():
                    launcher.status_state = "installing_hoodini"
                    launcher.status_message = "Installing Hoodini and downloading databases..."
                    append_log("🔍 Hoodini not found in PATH. Installing...\n")
                    # Pass the command so we can determine which databases to download
                    if not install_hoodini(launcher.command, launcher):
                        append_log("❌ Installation failed. Please check the errors above.\n")
                        launcher.status_state = "error"
                        launcher.status_message = "Hoodini installation failed"
                        return
                else:
                    append_log("✅ Hoodini is already installed\n\n")

                # Run the command
                launcher.status_state = "running"
                launcher.status_message = "Executing Hoodini analysis..."
                
                # Force update to ensure UI reflects the state change
                import time
                time.sleep(0.1)

                cmd = launcher.command
                
                # Handle input list mode - save to file if input_list is provided
                if launcher.input_list.strip():
                    # Create temporary file with the input list
                    import tempfile
                    fd, input_list_path = tempfile.mkstemp(suffix='.txt', prefix='hoodini_input_list_')
                    try:
                        with open(fd, 'w') as f:
                            f.write(launcher.input_list)
                        append_log(f"📝 Saved input list to: {input_list_path}\n")
                        # Replace --input <list> with --input <file_path>
                        import re
                        cmd = re.sub(r'--input\s+"[^"]+"', f'--input "{input_list_path}"', cmd)
                        cmd = re.sub(r"--input\s+'[^']+'", f"--input '{input_list_path}'", cmd)
                        cmd = re.sub(r'--input\s+\S+', f'--input "{input_list_path}"', cmd)
                    except Exception as e:
                        append_log(f"⚠️  Error saving input list to file: {e}\n")
                        os.close(fd)
                        launcher.status_state = "error"
                        launcher.status_message = "Failed to save input list"
                        return
                
                append_log(f"🚀 Running: {cmd}\n")
                append_log("=" * 60 + "\n")

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
                    append_log(line)
                process.wait()

                if process.returncode == 0:
                    append_log("\n" + "=" * 60 + "\n")
                    append_log("✅ Hoodini analysis completed successfully!\n")
                    append_log("=" * 60 + "\n")
                    
                    # Try to read the HTML visualization
                    output_folder = launcher.command.split('--output ')[-1].split()[0] if '--output' in launcher.command else 'results'
                    html_path = Path(output_folder) / 'hoodini-viz' / 'hoodini-viz.html'
                    
                    if html_path.exists():
                        try:
                            with open(html_path, 'r') as f:
                                html_content = f.read()
                            launcher.html_output = html_content
                            append_log(f"📊 Interactive visualization ready: {html_path}\n\n")
                        except Exception as e:
                            append_log(f"⚠️  Could not read HTML visualization: {e}\n")
                    else:
                        append_log(f"ℹ️  HTML visualization not found at {html_path}\n")
                    
                    launcher.status_state = "finished"
                    launcher.status_message = "Check output below"
                else:
                    append_log(f"\n❌ Process exited with code: {process.returncode}\n")
                    launcher.status_state = "error"
                    launcher.status_message = f"Process failed with exit code {process.returncode}"

                # Restore original directory if we changed it
                if hoodini_env_path.exists() and "original_dir" in locals():
                    os.chdir(original_dir)
            except Exception as e:
                append_log(f"❌ Error: {e}\n")
                launcher.status_state = "error"
                launcher.status_message = str(e)

    launcher = HoodiniLauncher()
    launcher.observe(run_hoodini, names=["run_requested"])
    return launcher
