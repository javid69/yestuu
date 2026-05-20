import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract the team section block starting at Aarif Mir and ending after the fourth member Mehak Rather
matches = list(re.finditer(r'Aarif Mir', content))
if matches:
    start_pos = max(0, matches[0].start() - 300)
    # Search for Mehak Rather and go past it
    mehak_match = re.search(r'Mehak Rather', content)
    if mehak_match:
        end_pos = min(len(content), mehak_match.end() + 600)
    else:
        end_pos = min(len(content), matches[0].end() + 3000)
    
    print(content[start_pos:end_pos])
