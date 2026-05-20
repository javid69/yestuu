import os
import glob
import re

def main():
    directory = r"c:\Users\javid\Videos\Restoran"
    html_files = glob.glob(os.path.join(directory, "*.html"))
    
    # Target block search pattern or replacement
    # We can use regex to find <div class="copyright">...</div> blocks and replace them.
    # The structure looks like:
    # <div class="copyright">
    #     <div class="row">
    #         <div class="col-md-6 ...">
    #             ...
    #         </div>
    #         <div class="col-md-6 ...">
    #             ...
    #         </div>
    #     </div>
    # </div>
    
    pattern = re.compile(
        r'<div\s+class="copyright"\s*>\s*<div\s+class="row"\s*>\s*<div\s+class="col-md-6\s+text-center\s+text-md-start\s+mb-3\s+mb-md-0"\s*>\s*&copy;\s*<a\s+class="border-bottom"\s+href="#">Asylen\s+Ventures</a>,\s*All\s*Right\s*Reserved\.\s*.*?Designed\s*By\s*<a\s*class="border-bottom"\s*href="https://htmlcodex.com"\s*>HTML\s*Codex</a>\s*</div>\s*<div\s+class="col-md-6\s+text-center\s+text-md-end"\s*>\s*<div\s+class="footer-menu"\s*>\s*<a\s+href="index\.html"\s*>Home</a>\s*<a\s+href=""\s*>Cookies</a>\s*<a\s+href="contact\.html"\s*>Help</a>\s*<a\s+href="contact\.html"\s*>FAQs</a>\s*</div>\s*</div>\s*</div>\s*</div>',
        re.DOTALL
    )
    
    new_block = """<div class="copyright">
                    <div class="row">
                        <div class="col-md-12 text-center mb-3 mb-md-0">
                            &copy; <a class="border-bottom" href="#">Asylen Ventures</a>, All Right Reserved.
                        </div>
                    </div>
                </div>"""

    for file_path in html_files:
        print(f"Processing: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Try exact replacement first
        exact_target = """            <div class="container">
                <div class="copyright">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            &copy; <a class="border-bottom" href="#">Asylen Ventures</a>, All Right Reserved. 
							
							<!--/*** The author’s attribution link below must remain intact on your website. ***/-->
                            <!--/*** If you wish to remove this credit link, please purchase the Pro Version from https://htmlcodex.com . ***/-->
                            Designed By <a class="border-bottom" href="https://htmlcodex.com">HTML Codex</a>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <div class="footer-menu">
                                <a href="index.html">Home</a>
                                <a href="">Cookies</a>
                                <a href="contact.html">Help</a>
                                <a href="contact.html">FAQs</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>"""
        
        exact_replacement = """            <div class="container">
                <div class="copyright">
                    <div class="row">
                        <div class="col-md-12 text-center mb-3 mb-md-0">
                            &copy; <a class="border-bottom" href="#">Asylen Ventures</a>, All Right Reserved.
                        </div>
                    </div>
                </div>
            </div>"""

        if exact_target in content:
            new_content = content.replace(exact_target, exact_replacement)
            print(f" -> Found and replaced using exact string match.")
        else:
            # Fallback to regex
            # Find a container div that surrounds the copyright block to ensure indentation is kept
            # Let's search for <div class="copyright">...</div>
            match = pattern.search(content)
            if match:
                new_content = pattern.sub(new_block, content)
                print(f" -> Found and replaced using regex match.")
            else:
                print(f" -> ERROR: Copyright block not matched in {os.path.basename(file_path)}!")
                continue
                
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

if __name__ == "__main__":
    main()
