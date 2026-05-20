import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Srinagar Family Apartment" in line:
        print(f"Match found at line {i+1}:")
        start = max(0, i - 10)
        end = min(len(lines), i + 20)
        for j in range(start, end):
            print(f"{j+1}: {lines[j]}", end="")
        print("-" * 50)
