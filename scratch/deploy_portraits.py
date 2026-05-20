import os
from PIL import Image

src_dir = r"C:\Users\javid\.gemini\antigravity\brain\abde59cf-cb82-43b1-a54b-c8f306ab40c1"
dest_dir = r"c:\Users\javid\Videos\Restoran\img"

mapping = {
    "team_aarif_1779294047339.png": "team-1.jpg",
    "team_zoya_1779294065422.png": "team-2.jpg",
    "team_imran_1779294083797.png": "team-3.jpg",
    "team_mehak_1779294102231.png": "team-4.jpg"
}

for src_name, dest_name in mapping.items():
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    
    if os.path.exists(src_path):
        print(f"Converting {src_path} -> {dest_path}")
        im = Image.open(src_path)
        rgb_im = im.convert('RGB')
        rgb_im.save(dest_path, 'JPEG', quality=95)
        print(f"Success: {dest_name} saved.")
    else:
        print(f"Error: Source file {src_path} not found.")
