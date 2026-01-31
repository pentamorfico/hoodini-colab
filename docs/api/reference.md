<a id="hoodini_colab.widget"></a>

# hoodini\_colab.widget

Hoodini Launcher widget - Interactive parameter configurator for Hoodini CLI.

<a id="hoodini_colab.widget.HoodiniLauncher"></a>

## HoodiniLauncher Objects

```python
class HoodiniLauncher(anywidget.AnyWidget)
```

Interactive Hoodini CLI launcher widget with Sidebar and Modes.

This widget provides an interactive interface for configuring and launching
Hoodini genomic neighborhood analysis with various input modes:
- Single Input: Single protein ID or FASTA
- Input List: Multiple IDs or files
- Input Sheet: Tabular data with multiple columns

**Attributes**:

- `command` - The generated command line string.
- `run_requested` - Trigger for running the command.
- `status_state` - Current status (idle, installing, running, finished, error).
- `status_message` - Status message to display.

<a id="hoodini_colab.widget.HoodiniLauncher.metacerberus_dbs"></a>

#### metacerberus\_dbs

Comma-separated list of MetaCerberus DBs

<a id="hoodini_colab.widget.HoodiniLauncher.keep_alive"></a>

#### keep\_alive

```python
def keep_alive(interval_seconds: int = 30)
```

Start a background heartbeat to keep Colab alive without blocking UI.

This runs in a daemon thread so trait callbacks (like the Run button)
remain responsive. The notebook cell can finish immediately.

**Example**:

  launcher = create_launcher()
  display(launcher)
  launcher.keep_alive()

<a id="hoodini_colab.widget.create_launcher"></a>

#### create\_launcher

```python
def create_launcher() -> HoodiniLauncher
```

Create and configure a HoodiniLauncher widget with execution handler.

This function sets up the launcher widget and attaches the execution handler
that manages installation checks and command execution.

**Returns**:

- `HoodiniLauncher` - Configured launcher widget ready to be displayed.
  

**Example**:

  >>> from hoodini_colab import create_launcher
  >>> launcher = create_launcher()
  >>> display(launcher)

<a id="hoodini_colab.utils"></a>

# hoodini\_colab.utils

Utility functions for hoodini installation and package management.

<a id="hoodini_colab.utils.check_launcher_packages"></a>

#### check\_launcher\_packages

```python
def check_launcher_packages() -> bool
```

Check if launcher dependencies are installed.

**Returns**:

- `bool` - True if all dependencies are installed, False otherwise.

<a id="hoodini_colab.utils.install_launcher_packages"></a>

#### install\_launcher\_packages

```python
def install_launcher_packages() -> bool
```

Install launcher dependencies.

**Returns**:

- `bool` - True if installation succeeded, False otherwise.

<a id="hoodini_colab.utils.check_hoodini_installed"></a>

#### check\_hoodini\_installed

```python
def check_hoodini_installed() -> bool
```

Check if hoodini is available in PATH or via pixi.

**Returns**:

- `bool` - True if hoodini is installed, False otherwise.

<a id="hoodini_colab.utils.run_cmd"></a>

#### run\_cmd

```python
def run_cmd(cmd: str, shell: bool = True) -> int
```

Run command and stream output.

**Arguments**:

- `cmd` - Command to run.
- `shell` - Whether to run command in shell.
  

**Returns**:

- `int` - Return code of the command.

<a id="hoodini_colab.utils.install_hoodini"></a>

#### install\_hoodini

```python
def install_hoodini(command: str = "", launcher=None) -> bool
```

Install pixi and hoodini environment.

**Arguments**:

- `command` - The hoodini command to be executed, used to determine which databases to download.
- `launcher` - Optional HoodiniLauncher widget to update status.
  

**Returns**:

- `bool` - True if installation succeeded, False otherwise.

