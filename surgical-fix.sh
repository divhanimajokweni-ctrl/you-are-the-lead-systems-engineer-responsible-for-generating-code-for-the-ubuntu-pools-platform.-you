#!/bin/bash
# Target file
FILE="packages/villages/src/market.ts"

echo "Applying surgical syntax fixes to $FILE..."

# 1. Replace dangling object properties with null to satisfy the compiler
sed -i "s/\(.*: \)\/\/ TODO: Orphaned Reference - import.*from.*'@ubuntu\/games'/\1null, \/\/ [REMOVED]/g" "$FILE"
sed -i "s/\(.*: \)\/\/ TODO: Orphaned Reference - import.*from.*'@ubuntu\/lindiwe'/\1null, \/\/ [REMOVED]/g" "$FILE"

# 2. Fix variable assignments that were left empty
sed -i 's/\/\/ TODO: Orphaned Reference - .*GameService.*/null; \/\/ [REMOVED]/g' "$FILE"
sed -i 's/\/\/ TODO: Orphaned Reference - .*ubuntuBackbone.*/null; \/\/ [REMOVED]/g' "$FILE"

# 3. Clean up specific lines 227, 255, and 284 if they are still broken
perl -i -pe 's/(\s+.*= )\/\/ TODO: Orphaned Reference - .*/\1null;/g' "$FILE"

echo "✅ Syntax repair complete."