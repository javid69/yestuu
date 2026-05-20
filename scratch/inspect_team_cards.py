import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"\n========================================\nFile: {hf}\n========================================")
    
    # Let's find all team-item blocks
    # We can match from <div class="team-item to the corresponding closing divs, or use a regex to capture their contents.
    # Since team-item is structured, we can search for the HTML between class="team-item" and the next </div></div> (which closes the inner elements)
    # Let's do a simple regex search for team-item blocks
    matches = re.finditer(r'<div class="team-item[^"]* text-center[^"]*">', content)
    for i, match in enumerate(matches):
        start = match.start()
        # Find closing tag matching this team-item (approximately, let's grab 800 characters)
        sub = content[start:start+1200]
        # Let's print the card's name, small, and search for any social buttons or images
        name_m = re.search(r'<h5[^>]*>(.*?)</h5>', sub)
        small_m = re.search(r'<small[^>]*>(.*?)</small>', sub)
        img_m = re.search(r'<img[^>]*src=["\'](.*?)["\']', sub)
        
        name = name_m.group(1) if name_m else "Unknown"
        role = small_m.group(1) if small_m else "Unknown"
        img = img_m.group(1) if img_m else "Unknown"
        
        print(f"Card {i+1}: Name='{name}', Role='{role}', Image='{img}'")
        
        # Check if there are social buttons or other social links inside the sub
        social_links = re.findall(r'btn-square|btn-social|fab fa-|btn-outline-primary', sub[:600])
        print(f"  Social buttons in team card: {social_links}")
        
        # Print the review paragraph if any
        p_m = re.search(r'<p[^>]*>(.*?)</p>', sub)
        review = p_m.group(1) if p_m else "No review found"
        print(f"  Review: {review}")
