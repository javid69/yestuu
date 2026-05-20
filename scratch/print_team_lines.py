with open('team.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines 70 to 180 of team.html:")
for i in range(70, min(len(lines), 180)):
    print(f"{i+1}: {lines[i]}", end="")
