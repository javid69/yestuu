import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

print("Analyzing HTML files for Team profiles and Social Media...")
for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"\n--- File: {hf} ---")
    
    # Check for team images
    team_imgs = re.findall(r'src=["\']img/team-\d\.jpg["\']', content)
    print(f"Team images found: {len(team_imgs)} occurrences ({team_imgs})")
    
    # Check for social icons in team section
    # Usually they look like <a class="btn btn-outline-light btn-social" ...> or similar, or fab fa-instagram etc.
    social_icons = re.findall(r'fab fa-(?:instagram|facebook-f|twitter|linkedin-in|youtube)', content)
    print(f"Social media icon classes found: {len(social_icons)}")
    
    # Check for text in team section
    # Let's see if there are instances of "btn-social" or "team-item"
    team_items = content.count('team-item')
    print(f"team-item classes found: {team_items}")
    
    # Check for reviews/p tags in team item
    reviews = re.findall(r'fst-italic text-muted', content)
    print(f"Reviews/testimonials found: {len(reviews)}")
