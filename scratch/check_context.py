import glob
import re

for filename in glob.glob('*.html'):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    # Search for Homeowners or Trusted
    for line_no, line in enumerate(content.splitlines(), 1):
        if "Homeowners" in line or "Trusted" in line:
            print(f"{filename}:{line_no}: {line.strip()}")
