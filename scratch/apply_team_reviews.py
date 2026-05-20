import glob
import re
import shutil

html_files = glob.glob('*.html')

# We'll map each team member's name to their review HTML
reviews = {
    "Aarif Mir": """<div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Aarif's local expertise and warm guidance made our Srinagar villa search incredibly smooth and stress-free."</p>
                            </div>""",
    "Zoya Bhat": """<div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Zoya's property insights are exceptional. She helped us secure a premium, turn-key retreat in Gulmarg with absolute care."</p>
                            </div>""",
    "Imran Shah": """<div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Imran coordinated our private estate walkthroughs with stellar professionalism. His attention to detail was top-tier."</p>
                            </div>""",
    "Mehak Rather": """<div class="px-3 pb-3 mt-3">
                                <p class="fst-italic text-muted mb-0 small" style="line-height: 1.4; min-height: 60px;">"Mehak's client-first dedication to perfection and seamless relations made us feel incredibly valued. Outstanding!"</p>
                            </div>"""
}

for filename in html_files:
    print(f"\nProcessing file: {filename}")
    
    # Back up the file
    backup_name = filename + '.bak'
    shutil.copyfile(filename, backup_name)
    print(f"  Backup created at {backup_name}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = content
    for name, review_html in reviews.items():
        pattern = re.compile(
            r'(<h5[^>]*>\s*' + re.escape(name) + r'\s*</h5>\s*<small>[^<]*</small>)\s*<div class="d-flex justify-content-center mt-3">.*?</div>', 
            re.DOTALL
        )
        
        matches = list(pattern.finditer(modified))
        if len(matches) > 0:
            modified = pattern.sub(r'\1\n                            ' + review_html, modified)
            print(f"  Successfully replaced social links for {name} ({len(matches)} occurrences)")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(modified)
    print(f"  File {filename} successfully updated.")
