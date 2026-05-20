import urllib.request
import urllib.error

urls = {
    "luxury_home_pool": "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-luxury-home-with-pool-42500-large.mp4",
    "forest_stream": "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    "snowy_mountain_range": "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-snowy-mountain-range-41588-large.mp4",
    "lake_mountains": "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-lake-surrounded-by-mountains-41574-large.mp4"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://mixkit.co/',
    'Origin': 'https://mixkit.co'
}

for name, url in urls.items():
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            print(f"{name}: SUCCESS ({status}) - {url}")
    except urllib.error.HTTPError as e:
        print(f"{name}: FAILED ({e.code})")
    except Exception as e:
        print(f"{name}: ERROR ({str(e)})")
