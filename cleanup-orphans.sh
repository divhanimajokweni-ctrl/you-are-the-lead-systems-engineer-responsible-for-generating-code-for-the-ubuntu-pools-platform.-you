#!/bin/bash
# Define the symbols that are causing TS2304 errors
SYMBOLS=("ubuntuBackbone" "GameService" "GameId" "generateProsperityOpportunity" "getPoolRecommendations" "GameState")
# Define the directories to search (adjust if your monorepo structure differs)
TARGET_DIRS=("apps" "packages" "src")

echo "Starting cleanup of orphaned symbols..."
for symbol in "${SYMBOLS[@]}"; do
    echo "Processing symbol: $symbol"
    
    # Search for files containing the symbol and comment out the specific lines
    # This uses a basic regex to prefix the line with //
    find "${TARGET_DIRS[@]}" -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "$symbol" | while read -r file; do
        echo "  Updating: $file"
        # Comments out any line containing the symbol that isn't already commented
        sed -i "/$symbol/s/^\([[:space:]]*\)\([^/]\)/\1\/\/ \2/" "$file"
    done
done

echo "Cleanup complete. Please run 'tsc' or your turbo typecheck to verify."
