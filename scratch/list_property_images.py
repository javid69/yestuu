import re
import glob

all_images = set()
for filename in glob.glob('*.html'):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all image tags in properties section
    # Let's search for <img class="flex-shrink-0 img-fluid rounded" src="..." ...>
    matches = re.findall(r'src="([^"]*)"', content)
    for match in matches:
        if "img/" in match:
            all_images.add(match)

print("All referenced images:", sorted(list(all_images)))
