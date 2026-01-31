#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pydoc-markdown "$ROOT_DIR/pydoc-markdown.yml"
