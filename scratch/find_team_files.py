import glob

html_files = glob.glob('*.html')
for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    if "Aarif Mir" in content:
        print(f"File {filename} contains Aarif Mir.")
