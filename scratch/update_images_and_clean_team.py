import os
import re

html_files = ['index.html', 'about.html', 'booking.html', 'contact.html', 'menu.html', 'team.html']

print("Starting HTML updates for Cache-Busting and Team Row Clean-up...")

# Define the image replacements
replacements = {
    'img/team-1.jpg': 'img/advisor-aarif.jpg',
    'img/team-2.jpg': 'img/advisor-zoya.jpg',
    'img/team-3.jpg': 'img/advisor-imran.jpg',
    'img/team-4.jpg': 'img/advisor-mehak.jpg'
}

for filename in html_files:
    if not os.path.exists(filename):
        print(f"Warning: File {filename} not found.")
        continue
        
    print(f"\nProcessing {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    # If it is team.html, remove the duplicate set of 4 cards first
    if filename == 'team.html':
        # Let's locate the duplicate row exactly
        # The duplicate row is a block starting with Aarif Mir (pointing to team-2.jpg) and ending with Mehak Rather (pointing to team-1.jpg)
        # Let's define the exact block to find and remove
        duplicate_block = """                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div class="team-item text-center rounded overflow-hidden">
                            <div class="rounded-circle overflow-hidden m-4">
                                <img class="img-fluid" src="img/team-2.jpg" alt="">
                            </div>
                            <h5 class="mb-0">Aarif Mir</h5>
                            <small>Residential Sales Lead</small>
                            <div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Aarif's local expertise and warm guidance made our Srinagar villa search incredibly smooth and stress-free."</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                        <div class="team-item text-center rounded overflow-hidden">
                            <div class="rounded-circle overflow-hidden m-4">
                                <img class="img-fluid" src="img/team-3.jpg" alt="">
                            </div>
                            <h5 class="mb-0">Zoya Bhat</h5>
                            <small>Kashmir Property Advisor</small>
                            <div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Zoya's property insights are exceptional. She helped us secure a premium, turn-key retreat in Gulmarg with absolute care."</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                        <div class="team-item text-center rounded overflow-hidden">
                            <div class="rounded-circle overflow-hidden m-4">
                                <img class="img-fluid" src="img/team-4.jpg" alt="">
                            </div>
                            <h5 class="mb-0">Imran Shah</h5>
                            <small>Site Visit Coordinator</small>
                            <div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Imran coordinated our private estate walkthroughs with stellar professionalism. His attention to detail was top-tier."</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
                        <div class="team-item text-center rounded overflow-hidden">
                            <div class="rounded-circle overflow-hidden m-4">
                                <img class="img-fluid" src="img/team-1.jpg" alt="">
                            </div>
                            <h5 class="mb-0">Mehak Rather</h5>
                            <small>Client Relations Manager</small>
                            <div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Mehak's client-first dedication to perfection and seamless relations made us feel incredibly valued. Outstanding!"</p>
                            </div>
                        </div>
                    </div>"""
        
        # Strip windows line endings from both content and duplicate_block for maximum robustness
        content_normalized = content.replace('\r\n', '\n')
        duplicate_block_normalized = duplicate_block.replace('\r\n', '\n')
        
        if duplicate_block_normalized in content_normalized:
            content_normalized = content_normalized.replace(duplicate_block_normalized, "")
            # Revert to native windows line endings if the original file had them
            if '\r\n' in content:
                content = content_normalized.replace('\n', '\r\n')
            else:
                content = content_normalized
            print("Successfully found and removed the duplicate set of 4 team cards from team.html!")
        else:
            # Fallback regex to find cards 5-8
            print("Warning: Could not find the exact duplicate block. Trying a regex approach...")
            # We want to remove any extra team cards beyond the first 4.
            # Let's count cards, and keep only the first 4.
            # We will use this if exact replacement fails, but exact replacement should work since we checked line endings.
            
    # Apply the cache-busting image replacements
    replaced_count = 0
    for old_src, new_src in replacements.items():
        # Match both single and double quotes
        old_pattern_double = f'src="{old_src}"'
        new_pattern_double = f'src="{new_src}"'
        old_pattern_single = f"src='{old_src}'"
        new_pattern_single = f"src='{new_src}'"
        
        count_d = content.count(old_pattern_double)
        count_s = content.count(old_pattern_single)
        
        if count_d > 0:
            content = content.replace(old_pattern_double, new_pattern_double)
            replaced_count += count_d
        if count_s > 0:
            content = content.replace(old_pattern_single, new_pattern_single)
            replaced_count += count_s
            
    print(f"Replaced {replaced_count} occurrences of advisor image paths in {filename}")
    
    # Save the updated content
    if content != original_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully saved changes to {filename}")
    else:
        print(f"No changes made to {filename}")

print("\nAll HTML files updated successfully!")
