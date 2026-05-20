with open('team.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
headings = re.findall(r'<h\d[^>]*>.*?</h\d>', content, re.DOTALL | re.IGNORECASE)
for h in headings:
    print("Heading:", h.strip())
