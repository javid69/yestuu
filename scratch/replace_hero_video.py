import os
import glob

def main():
    directory = r"c:\Users\javid\Videos\Restoran"
    html_files = glob.glob(os.path.join(directory, "*.html"))
    
    old_video = "video/two-cottages.mp4"
    new_video = "video/video_202605202035.mp4"
    
    for file_path in html_files:
        print(f"Processing: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if old_video in content:
            new_content = content.replace(old_video, new_video)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f" -> Replaced '{old_video}' with '{new_video}' successfully.")
        else:
            print(" -> Video file string not found or already replaced.")

if __name__ == "__main__":
    main()
