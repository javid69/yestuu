with open('team.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the heading text before the team items
# Let's search for the titles in team.html
import re
section_headers = re.findall(r'<div class="section-title[^>]*>.*?</div>\s*<h\d[^>]*>.*?</h\d>', content, re.DOTALL)
for sh in section_headers:
    print("Section header:", sh.strip())
