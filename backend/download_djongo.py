import urllib.request
import zipfile
import os
import shutil

url = "https://github.com/nesdis/djongo/archive/refs/heads/master.zip"
zip_path = "djongo-master.zip"
extract_path = "djongo_source"

print("Downloading...")
try:
    urllib.request.urlretrieve(url, zip_path)
    print("Downloaded.")
except Exception as e:
    print(f"Download failed: {e}")
    exit(1)

print("Extracting...")
try:
    if os.path.exists(extract_path):
        shutil.rmtree(extract_path)
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print("Extracted.")
except Exception as e:
    print(f"Extraction failed: {e}")
    exit(1)
