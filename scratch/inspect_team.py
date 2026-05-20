import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Search for Aarif Mir
matches = re.finditer(r'Aarif Mir', content)
for m in matches:
    start = max(0, m.start() - 500)
    end = min(len(content), m.end() + 1000)
    print("--- FOUND TEAM SECTION IN index.html ---")
    print(content[start:end])
    print("-" * 50)
