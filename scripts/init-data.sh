#!/bin/sh
# init-data.sh — Initializes the /data volume with wiki skeleton files
# if they don't already exist. Runs before npm start on every boot.
#
# SAFE BY DESIGN: this script never overwrites existing data. All copies
# are guarded by [ ! -f ] checks so redeploying the app never touches
# wiki pages, ingest logs, recommendations, or the manifest.

WIKI_DIR="${WIKI_PATH:-/data/wiki}"
RAW_DIR="${RAW_SOURCES_PATH:-/data/raw-sources}"

mkdir -p "$WIKI_DIR" "$WIKI_DIR/topics" "$WIKI_DIR/decisions" \
         "$WIKI_DIR/recommendations" "$WIKI_DIR/queries" \
         "$RAW_DIR"

# Copy seed files only if not already present on the volume.
# Existing wiki content (topics/, decisions/, recommendations/, log.md,
# index.md) is NEVER touched by a redeploy.
if [ ! -f "$WIKI_DIR/index.md" ]; then
  echo "Initializing wiki skeleton on volume..."
  cp /app/wiki-seed/SCHEMA.md "$WIKI_DIR/SCHEMA.md"
  cp /app/wiki-seed/index.md  "$WIKI_DIR/index.md"
  echo "Wiki skeleton initialized at $WIKI_DIR"
else
  echo "Wiki already initialized at $WIKI_DIR — skipping seed copy"
fi

# Always update SCHEMA.md from the image so schema changes ship with deploys,
# but ONLY the schema governance doc — never wiki content pages.
cp /app/wiki-seed/SCHEMA.md "$WIKI_DIR/SCHEMA.md"

# Seed an empty manifest if one does not exist yet (first boot only).
if [ ! -f "$RAW_DIR/manifest.json" ]; then
  echo "{}" > "$RAW_DIR/manifest.json"
  echo "Empty manifest created at $RAW_DIR/manifest.json"
fi

echo "Data volume ready: wiki=$WIKI_DIR raw=$RAW_DIR"
