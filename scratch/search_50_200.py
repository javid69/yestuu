import glob

for filename in glob.glob('*.html'):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for line_no, line in enumerate(content.splitlines(), 1):
        if "50" in line or "200" in line:
            if "bootstrap" not in line and "animate" not in line and "jquery" not in line:
                print(f"{filename}:{line_no}: {line.strip()}")
