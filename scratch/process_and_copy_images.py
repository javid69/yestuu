import os
from PIL import Image

# The generated images and their matching output paths
image_mappings = {
    "menu_2_1779291443289.png": "menu-2.jpg",
    "menu_3_1779291464509.png": "menu-3.jpg",
    "menu_4_1779291484646.png": "menu-4.jpg",
    "menu_5_1779291503204.png": "menu-5.jpg",
    "menu_6_1779291523629.png": "menu-6.jpg",
    "menu_7_1779291543169.png": "menu-7.jpg",
    "menu_8_1779291561006.png": "menu-8.jpg"
}

artifact_dir = r"C:\Users\javid\.gemini\antigravity\brain\abde59cf-cb82-43b1-a54b-c8f306ab40c1"
output_dir = r"c:\Users\javid\Videos\Restoran\img"

for png_name, jpg_name in image_mappings.items():
    src_path = os.path.join(artifact_dir, png_name)
    dest_path = os.path.join(output_dir, jpg_name)
    
    if os.path.exists(src_path):
        print(f"Processing {png_name} -> {jpg_name}...")
        img = Image.open(src_path)
        # Convert to RGB (in case of RGBA)
        rgb_img = img.convert('RGB')
        # Resize or optimize if necessary, but keep it high quality
        rgb_img.save(dest_path, 'JPEG', quality=90)
        print(f"Successfully saved to {dest_path}")
    else:
        print(f"Error: Source file {src_path} does not exist!")
