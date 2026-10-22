import httpx
import json
import time
import os
import zipfile
import urllib.parse

ENDPOINT = "https://pwabuilder-cloudapk.azurewebsites.net"

payload = {
    "additionalTrustedOrigins": [],
    "appVersion": "1.0.0.0",
    "appVersionCode": 1,
    "backgroundColor": "#090a0f",
    "display": "standalone",
    "enableSiteSettingsShortcut": True,
    "enableNotifications": False,
    "includeSourceCode": True,
    "fallbackType": "customtabs",
    "features": {
        "locationDelegation": {
            "enabled": True
        },
        "playBilling": {
            "enabled": False
        }
    },
    "host": "https://gifts-fork-managed-leslie.trycloudflare.com",
    "iconUrl": "https://gifts-fork-managed-leslie.trycloudflare.com/icon-512.png",
    "launcherName": "ClosetOS",
    "name": "ClosetOS",
    "maskableIconUrl": "https://gifts-fork-managed-leslie.trycloudflare.com/maskable-icon-512.png",
    "navigationColor": "#090a0f",
    "navigationColorDark": "#090a0f",
    "navigationDividerColor": "#090a0f",
    "navigationDividerColorDark": "#090a0f",
    "orientation": "portrait",
    "packageId": "com.closetos.pithoragarh",
    "pwaUrl": "https://gifts-fork-managed-leslie.trycloudflare.com",
    "shortcuts": [],
    "signingMode": "new",
    "signing": {
        "file": None,
        "alias": "closetos-key",
        "fullName": "ClosetOS Developer",
        "organization": "ClosetOS",
        "organizationalUnit": "Style AI Engineering",
        "countryCode": "IN",
        "keyPassword": "ClosetOSPass2026!",
        "storePassword": "ClosetOSPass2026!"
    },
    "splashScreenFadeOutDuration": 300,
    "startUrl": "/",
    "themeColor": "#090a0f",
    "themeColorDark": "#090a0f",
    "webManifestUrl": "https://gifts-fork-managed-leslie.trycloudflare.com/manifest.json"
}

headers = {
    "Content-Type": "application/json",
    "platform-identifier": "ServerUI",
    "platform-identifier-version": "1.0.0"
}

print("[CloudAPK] Enqueuing package job...")
with httpx.Client(timeout=120.0, follow_redirects=True) as client:
    resp = client.post(f"{ENDPOINT}/enqueuePackageJob", json=payload, headers=headers)
    print(f"[CloudAPK] Enqueue status: {resp.status_code}")
    if resp.status_code != 200:
        print("Response:", resp.text)
        exit(1)

    data = resp.json()
    job_id = data.get("id")
    token = data.get("accessToken")
    print(f"[CloudAPK] Job ID: {job_id}")
    print(f"[CloudAPK] Token: {token[:20]}...")

    auth_headers = {"Authorization": f"Bearer {token}"}
    start_time = time.time()
    
    while time.time() - start_time < 300:
        time.sleep(5)
        encoded_id = urllib.parse.quote(job_id)
        poll_resp = client.get(f"{ENDPOINT}/getPackageJob?id={encoded_id}", headers=auth_headers)
        if poll_resp.status_code != 200:
            print(f"[CloudAPK] Polling status: {poll_resp.status_code}")
            continue
        
        job_info = poll_resp.json()
        status = job_info.get("status")
        print(f"[CloudAPK] Status: {status} ({int(time.time() - start_time)}s)")
        
        if status == "Completed":
            print("[CloudAPK] Packaging completed! Downloading zip package (streaming)...")
            dl_url = f"{ENDPOINT}/downloadPackageZip?id={encoded_id}"
            zip_path = "closetos_app_package.zip"
            
            total_bytes = 0
            with open(zip_path, "wb") as f:
                with client.stream("GET", dl_url, headers=auth_headers) as stream_resp:
                    print(f"[CloudAPK] Download HTTP Status: {stream_resp.status_code}")
                    for chunk in stream_resp.iter_bytes(chunk_size=32768):
                        f.write(chunk)
                        total_bytes += len(chunk)
                        if total_bytes % (1024 * 512) == 0:
                            print(f"[CloudAPK] Downloaded {total_bytes // 1024} KB...")
            
            print(f"[CloudAPK] Download finished! Saved {zip_path} ({total_bytes} bytes)")
            
            os.makedirs("extracted_apk", exist_ok=True)
            with zipfile.ZipFile(zip_path, "r") as z:
                z.extractall("extracted_apk")
                print("[CloudAPK] Extracted package contents:")
                apk_found = None
                for root, dirs, files in os.walk("extracted_apk"):
                    for file in files:
                        full_p = os.path.join(root, file)
                        print("  -", full_p)
                        if file.endswith(".apk"):
                            apk_found = full_p
                
                if apk_found:
                    target_dest = "frontend/public/closetos.apk"
                    with open(apk_found, "rb") as sf, open(target_dest, "wb") as df:
                        df.write(sf.read())
                    print(f"🎉 SUCCESS! APK placed at: {target_dest} ({os.path.getsize(target_dest)} bytes)")
                else:
                    print("⚠️ No .apk in zip, checking for .aab or project...")
            break
        elif status == "Failed":
            print("[CloudAPK] Job failed!")
            for log in job_info.get("logs", []):
                print("  Log:", log)
            exit(1)
