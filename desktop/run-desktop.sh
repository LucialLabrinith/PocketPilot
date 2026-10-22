#!/bin/bash
# =====================================================================
# PocketPilot — JavaFX Desktop Application Launcher
# Runs the desktop client connecting to the shared backend
# =====================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Checking Java 21 environment..."
java -version

echo "Launching PocketPilot JavaFX Desktop Client..."
mvn javafx:run
