#!/bin/bash
# Process attendee headshots for the Jamie bach site.
#
# Usage:
#   1. Drop 9 photos in ~/Desktop/jamie-faces/ named:
#      jamie.jpg, hannah.jpg, ellie.jpg, erica.jpg, mahip.jpg,
#      gwenna.jpg, zoe.jpg, daniella.jpg, abbey.jpg
#      (jpg/jpeg/png/heic/webp all OK — script auto-converts)
#   2. Run this script.
#
# It crops to a centered square at 600x600 and writes JPEGs into
# public/jamie/faces/{id}.jpg. The PortraitCard renders them as circles
# so any roughly-square or already-round source works fine.

set -e
SRC="${HOME}/Desktop/jamie-faces"
DST="$(cd "$(dirname "$0")/.." && pwd)/public/jamie/faces"
mkdir -p "$DST"

if ! command -v sips >/dev/null 2>&1; then
  echo "Error: macOS 'sips' not found." >&2
  exit 1
fi

if [ ! -d "$SRC" ]; then
  echo "Error: $SRC does not exist. Create it and drop your photos in." >&2
  exit 1
fi

count=0
for ext in jpg jpeg png heic webp JPG JPEG PNG HEIC WEBP; do
  for f in "$SRC"/*.$ext; do
    [ -f "$f" ] || continue
    name="$(basename "$f")"
    id="${name%.*}"
    id="$(echo "$id" | tr '[:upper:]' '[:lower:]')"
    out="$DST/${id}.jpg"
    echo "→ $name → ${id}.jpg"
    # Square-crop to the smaller of width/height, then resize to 600px,
    # and save as JPEG.
    sips -s format jpeg \
         -c 600 600 \
         "$f" --out "$out" >/dev/null
    count=$((count + 1))
  done
done

echo ""
echo "Processed $count photos."
ls -1 "$DST"
