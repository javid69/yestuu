import glob
import os

for root, dirs, files in os.walk('js'):
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            for line_no, line in enumerate(content.splitlines(), 1):
                if "counter" in line or "counterup" in line or "50" in line:
                    print(f"{path}:{line_no}: {line.strip()}")
