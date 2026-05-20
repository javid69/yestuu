with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's print out what the file will look like around the edit point
print("BEFORE REMOVAL (Around edit point):")
for idx in range(520, 535):
    print(f"{idx+1}: {lines[idx]}", end="")

print("...")
for idx in range(710, 726):
    print(f"{idx+1}: {lines[idx]}", end="")

# Remove lines 527 to 712 (0-indexed: index 526 to 711 inclusive, so slice [526:712])
new_lines = lines[:526] + lines[712:]

print("\n\nAFTER PROPOSED REMOVAL:")
for idx in range(520, 545):
    if idx < len(new_lines):
        print(f"{idx+1}: {new_lines[idx]}", end="")
