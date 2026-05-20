import glob
import re

for filename in glob.glob('*.html'):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(match):
        img_tag = match.group(0)
        # Check if it references our properties images
        targets = ["img/menu-", "img/kashmir-cottages", "img/villa_exterior_", "img/villa_interior_"]
        if any(x in img_tag for x in targets):
            # Extract src
            src_match = re.search(r'src="([^"]*)"', img_tag)
            src = src_match.group(1) if src_match else ""
            
            # Extract alt
            alt_match = re.search(r'alt="([^"]*)"', img_tag)
            alt = alt_match.group(1) if alt_match else ""
            
            # Rebuild a clean img tag with the property-thumbnail class
            return f'<img class="flex-shrink-0 img-fluid rounded property-thumbnail" src="{src}" alt="{alt}">'
        return img_tag

    # We match <img tag with class containing flex-shrink-0 and rounded
    new_content = re.sub(r'<img\s+class="flex-shrink-0 img-fluid rounded"[^>]+>', replacer, content)
    
    if new_content != content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes in {filename}")
