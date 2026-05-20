import glob
import re

html_files = glob.glob('*.html')
for filename in html_files:
    print(f"=== File: {filename} ===")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    links = re.findall(r'<link[^>]*>', content)
    for link in links:
        if "css" in link:
            print("  Link tag:", link)
