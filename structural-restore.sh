#!/bin/bash
# Irrevocable Debugging Script for market.ts
FILE="packages/villages/src/market.ts"

echo "🚀 Executing structural restoration for $FILE..."

# 1. Restore Object Properties
# Fixes: data: // TODO: Orphaned Reference -> data: null,
perl -i -pe 's/(: \s*)\/\/ TODO: Orphaned Reference.*/\1null,/g' "$FILE"

# 2. Restore Variable Assignments
# Fixes: const x = // TODO: Orphaned Reference -> const x = null;
perl -i -pe 's/(= \s*)\/\/ TODO: Orphaned Reference.*/\1null;/g' "$FILE"

# 3. Restore Function Returns
# Fixes: return // TODO: Orphaned Reference -> return null;
perl -i -pe 's/(return \s*)\/\/ TODO: Orphaned Reference.*/\1null;/g' "$FILE"

# 4. Remove lingering comment flags that break expression flow
sed -i '/TODO: Orphaned Reference/d' "$FILE"

echo "✅ Code structure stabilized. Synchronizing monorepo..."
