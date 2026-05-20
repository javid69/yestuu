import shutil

# Make a backup first
shutil.copyfile('css/style.css', 'css/style.css.bak')
print("Backup created at css/style.css.bak")

with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove the duplicate lines 527 to 712 (0-indexed: index 526 to 711 inclusive, so slice [526:712])
new_lines = lines[:526] + lines[712:]

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("CSS syntax fixed successfully in css/style.css!")
