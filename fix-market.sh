#!/bin/bash
# Target file
FILE="packages/villages/src/market.ts"

echo "Applying surgical syntax fixes to $FILE..."

# 1. Replace broken GameService calls inside objects with null to preserve commas
# Before: data: // GameService.getData(), (Broken)
# After:  data: null, // [REMOVED]
sed -i "s/\(.*: \)\/\/ TODO: Orphaned Reference - import.*from.*'@ubuntu\/games'/\1null, \/\/ [REMOVED]/g" "$FILE"
sed -i "s/\(.*: \)\/\/ TODO: Orphaned Reference - import.*from.*'@ubuntu\/lindiwe'/\1null, \/\/ [REMOVED]/g" "$FILE"

# 2. Fix lines where the entire line was commented out but contained a closing brace or paren
# This is common in promise chains or nested objects.
# We will search for common orphaned patterns and clean them.
sed -i 's/\/\/ TODO: Orphaned Reference - .*GameService.*/null; \/\/ [REMOVED]/g' "$FILE"
sed -i 's/\/\/ TODO: Orphaned Reference - .*ubuntuBackbone.*/null; \/\/ [REMOVED]/g' "$FILE"

# 3. Specifically clean up known problematic lines (227, 255, 284)
# If these lines are part of an assignment, we set them to null.
perl -i -pe 's/(\s+.*= )\/\/ TODO: Orphaned Reference - .*/\1null;/g' "$FILE"

echo "✅ Syntax cleanup complete. Running typecheck..."
bun run typecheck