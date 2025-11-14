#!/bin/bash
# Create placeholder icon files
mkdir -p src/assets/icons

# Create placeholder icon text files
for size in 16 48 128; do
  echo "Placeholder for ${size}x${size} icon. Replace with actual PNG icon." > "src/assets/icons/icon${size}.png"
done

echo "Icon placeholders created. Replace with actual PNG files before production."
