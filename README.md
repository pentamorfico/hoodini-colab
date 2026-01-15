# <img src="assets/images/hoodini_logo.svg" alt="Hoodini Logo" height="40" align="center"> hoodini-colab [![PyPI](https://img.shields.io/pypi/v/hoodini-colab?cacheSeconds=300)](https://pypi.org/project/hoodini-colab/) [![Python](https://img.shields.io/pypi/pyversions/hoodini-colab?cacheSeconds=300)](https://pypi.org/project/hoodini-colab/) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/pentamorfico/hoodini-colab/blob/main/hoodini_colab.ipynb)

Interactive parameter configurator for the Hoodini CLI genomic neighborhood analysis tool.

## What is this?

hoodini-colab is an interactive Jupyter widget that makes it easy to configure and run genomic neighborhood analyses with Hoodini. Instead of remembering dozens of command-line parameters and flags, you get a visual interface where you can click, select, and configure everything through an intuitive web-based UI.

The launcher provides three different input modes depending on your needs. You can analyze a single protein, process a list of multiple proteins, or work with a detailed spreadsheet containing specific genomic coordinates. As you configure your parameters, the tool generates the complete command line in real-time, which you can copy for later use or execute directly from the interface.

The widget handles all the complexity of installing Hoodini and its dependencies automatically through pixi. When you click the run button, it checks if Hoodini is installed, sets up the environment if needed, and executes your analysis while showing you the progress in real-time. This means you can go from zero to running a full genomic neighborhood analysis in just a few clicks, even if you've never used Hoodini before.

## Key Features

The interface is organized into collapsible sections covering all aspects of Hoodini's functionality. You can configure remote BLAST searches, adjust neighborhood window sizes, select clustering methods, choose tree construction algorithms, and enable various annotation tools like PADLOC, DefenseFinder, and CCtyper. The launcher includes smart defaults for every parameter, so you can start with a basic analysis and only customize what you need.

Every parameter shows helpful descriptions explaining what it does, and the generated command updates instantly as you make changes. You can copy the command to run it manually later, or click the "Run" button to execute it immediately. The widget displays installation progress and analysis status, so you always know what's happening.

## Installation

The easiest way to install hoodini-colab is directly from PyPI using pip:

```bash
pip install hoodini-colab
```

This will automatically install all required dependencies including anywidget, traitlets, and ipython. If you want to contribute to the development or modify the code, you can install it in editable mode:

```bash
git clone https://github.com/pentamorfico/hoodini-colab.git
cd hoodini-colab
pip install -e ".[dev]"
```

The development installation includes additional tools like ruff for linting and mypy for type checking.

## Quick Start

The fastest way to try hoodini-colab is through Google Colab, where you don't need to install anything on your computer. Just click the badge below and the notebook will open in your browser:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/pentamorfico/hoodini-colab/blob/main/hoodini_colab.ipynb)

Once the notebook opens, run the cells in order. The first cell installs the package, and the second cell displays the interactive launcher widget where you can start configuring your analysis immediately.

If you're working in a local Jupyter notebook, the setup is equally simple:

```python
from hoodini_colab import create_launcher

launcher = create_launcher()
display(launcher)
```

The widget will check for required dependencies and install Hoodini automatically through pixi if it's not already present on your system. When you click the run button, it handles the entire installation process in the background, downloads necessary databases, and executes your configured analysis.

## Advanced Usage

If you need more control over the widget behavior, you can work with the HoodiniLauncher class directly. This allows you to programmatically access the generated command, monitor the execution status, or integrate the widget into more complex workflows:

```python
from hoodini_colab import HoodiniLauncher

launcher = HoodiniLauncher()

# Access the generated command at any time
print(launcher.command)

# Set up a callback to monitor status changes
def on_status_change(change):
    print(f"Status: {launcher.status_state} - {launcher.status_message}")

launcher.observe(on_status_change, names=['status_state'])

display(launcher)
```

## Use Cases

**Single Protein Analysis**: When you want to explore the genomic neighborhood of a specific protein, select the "Single Input" mode and enter a protein ID like `WP_000000001.1`. You can configure optional parameters such as remote BLAST e-values or window sizes, then click "Run Hoodini Analysis" to start the process.

**Batch Analysis**: If you have multiple proteins to analyze with the same parameters, switch to "Input List" mode and paste your protein IDs with one per line. The launcher will process all of them using your configured settings, making it easy to run consistent analyses across many sequences.

**Custom Coordinates**: For more precise control over exactly which genomic regions to analyze, use "Input Sheet" mode. This lets you specify protein IDs along with their exact nucleotide coordinates, strand information, and assembly IDs in a tabular format. You can either fill in the table manually or paste TSV data directly.

## Parameter Organization

The launcher organizes Hoodini's extensive set of parameters into logical categories to make configuration easier. Input and output settings let you specify file paths and directories. Remote BLAST options control e-values and the number of targets to retrieve when searching remote databases. Performance settings include thread count and NCBI API keys for faster database access.

Neighborhood window parameters determine how much sequence context to include around your target proteins. Clustering options control how similar sequences are grouped together. Tree construction methods let you choose from taxonomy-based trees, neighbor-joining, maximum likelihood, or various distance-based approaches.

Pairwise comparison settings configure ANI and AAI calculations, while annotation toggles enable tools like PADLOC for antiphage defense systems, DefenseFinder, CCtyper for CRISPR-Cas detection, and many others. Link configuration determines whether to compute protein and nucleotide similarity connections between neighborhoods.

## Development

Setting up a development environment is straightforward. Clone the repository and install it in editable mode with the dev dependencies:

```bash
git clone https://github.com/pentamorfico/hoodini-colab.git
cd hoodini-colab
pip install -e ".[dev]"
```

The project uses ruff for fast Python linting and formatting. You can check code style with `ruff check src/` and automatically format code with `ruff format src/`. Type checking is handled by mypy, which you can run with `mypy src/`.

The project structure follows modern Python packaging conventions with a `src/` layout. All package code lives in `src/hoodini_colab/`, which includes the main widget class, utility functions for installation, and the JavaScript frontend code. Configuration is handled through `pyproject.toml` using the Hatchling build backend.

```
hoodini-colab/
├── src/
│   └── hoodini_colab/
│       ├── __init__.py
│       ├── widget.py          # Main widget class
│       ├── widget.js          # Frontend JavaScript
│       └── utils.py           # Installation utilities
├── pyproject.toml             # Modern Python packaging
├── README.md
├── LICENSE
└── .gitignore
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to improve the code, please open an issue on GitHub or submit a pull request. The project follows standard Python development practices with ruff for code style and mypy for type checking.

## Acknowledgments

This project is built on top of anywidget, a modern framework for creating interactive Jupyter widgets with a great developer experience. The configuration system uses traitlets, which provides a robust way to handle typed attributes and callbacks. The launcher integrates seamlessly with Hoodini's pixi-based installation system to provide a smooth user experience.

