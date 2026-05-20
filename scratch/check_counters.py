import glob
import re

for filename in glob.glob('*.html'):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all instances of data-toggle="counter-up" and print the containing element
    matches = re.findall(r'<[^>]*data-toggle="counter-up"[^>]*>([^<]*)</[^>]+>', content)
    print(f"{filename}: {matches}")
