import glob
import re

html_files = glob.glob('*.html')
for filename in html_files:
    print(f"=== File: {filename} ===")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find img tags inside tab-content
    # Let's grab the tab-content block
    tab_contents = re.findall(r'<div class="tab-content">.*?</div>\s*</div>\s*</div>\s*</div>', content, re.DOTALL)
    if not tab_contents:
        # Try a broader search for any tab-content
        tab_contents = re.findall(r'class="tab-content".*?</div>', content, re.DOTALL)
        
    for tc in tab_contents:
        img_tags = re.findall(r'<img[^>]*>', tc)
        for img in img_tags:
            print("  Img tag:", img)
