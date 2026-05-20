import glob
import os
from PIL import Image

output_dir = r"c:\Users\javid\Videos\Restoran\img"
for f in sorted(glob.glob(os.path.join(output_dir, "*"))):
    if f.lower().endswith(('.png', '.jpg', '.jpeg')):
        try:
            img = Image.open(f)
            print(f"{os.path.basename(f)}: {img.size} {img.format}")
        except Exception as e:
            print(f"{os.path.basename(f)}: Error opening: {e}")
