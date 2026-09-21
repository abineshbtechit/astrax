import urllib.request
import re

url_js = 'https://ncrb-secure-legal-dms-952803613565.asia-southeast1.run.app/assets/index-xymew4BB.js'
url_css = 'https://ncrb-secure-legal-dms-952803613565.asia-southeast1.run.app/assets/index-BhyXbDcY.css'
req = urllib.request.Request(url_js, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    js_content = resp.read().decode('utf-8', errors='ignore')

with open('demo_js_dump.txt', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"JS saved, length: {len(js_content)}")

# Look for routes and views
paths = set(re.findall(r'path:"([^"]+)"', js_content))
print("Paths:", sorted(list(paths)))

# Extract navigation items or component names
navs = re.findall(r'label:"([^"]+)"[^}]+href:"([^"]+)"', js_content)
print("Navs:", navs)
