with open('team.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Aarif Mir" in line:
        print(f"Match found in team.html at line {i+1}:")
        start = max(0, i - 5)
        end = min(len(lines), i + 15)
        for j in range(start, end):
            print(f"{j+1}: {lines[j]}", end="")
        print("-" * 50)
