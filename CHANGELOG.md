# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-15

### Added
- Initial release of hoodini-colab
- Interactive Jupyter widget for Hoodini CLI parameter configuration
- Three input modes: Single Input, Input List, and Input Sheet
- Comprehensive parameter configuration interface
- Automatic Hoodini installation via pixi
- Real-time command generation and preview
- Copy command functionality
- Status indicators for installation and execution
- Modern, responsive UI with Space Grotesk font
- Dark mode command preview terminal
- Collapsible parameter categories
- Support for all Hoodini CLI parameters:
  - Input/Output configuration
  - Remote BLAST settings
  - Performance tuning
  - Neighborhood window configuration
  - Clustering options
  - Tree construction methods
  - Pairwise comparison settings
  - Annotation tools (PADLOC, DefenseFinder, CCtyper, etc.)
  - Link configuration (protein and nucleotide)
- Multi-select domain database picker
- Switch controls for boolean parameters
- Smart parameter visibility based on input mode
- Google Colab compatibility

### Development
- Modern Python packaging with pyproject.toml
- Hatchling build backend
- Ruff for linting and formatting
- MyPy for type checking
- GitHub Actions CI/CD pipeline
- Development mode installation support
- Comprehensive README with examples
- MIT License

[Unreleased]: https://github.com/pentamorfico/hoodini-colab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pentamorfico/hoodini-colab/releases/tag/v0.1.0
