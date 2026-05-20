with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Look at lines 330 to 535
print("--- Lines 330 to 350 ---")
for idx in range(330, 350):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")

print("\n--- Lines 520 to 540 ---")
for idx in range(520, 540):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")

print("\n--- Lines 710 to 735 ---")
for idx in range(710, 735):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
