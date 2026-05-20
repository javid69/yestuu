def check_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    open_count = 0
    close_count = 0
    unmatched_open = []
    
    # Simple state machine to ignore comments
    in_comment = False
    i = 0
    n = len(content)
    
    while i < n:
        if not in_comment and i + 1 < n and content[i] == '/' and content[i+1] == '*':
            in_comment = True
            i += 2
            continue
        elif in_comment and i + 1 < n and content[i] == '*' and content[i+1] == '/':
            in_comment = False
            i += 2
            continue
        
        if not in_comment:
            if content[i] == '{':
                open_count += 1
            elif content[i] == '}':
                close_count += 1
                
        i += 1
        
    print(f"File: {filename}")
    print(f"Open braces: {open_count}")
    print(f"Close braces: {close_count}")
    if open_count == close_count:
        print("Braces are perfectly balanced! No syntax errors.")
    else:
        print("WARNING: Braces are UNBALANCED!")

check_braces('css/style.css')
