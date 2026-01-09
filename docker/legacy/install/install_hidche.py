#!/usr/bin/env python3
"""
Installation Script for Legacy Game Server
Based on: https://storage.hided.net/gitea/devsam/docker/hidche/install
"""

import os
import time
import requests
import subprocess

# Configuration from environment
GAME_PATH = os.environ.get('HIDCHE_GAME_PATH', 'http://localhost:8080/sam')
ADMIN_USER = os.environ.get('HIDCHE_ADMIN', 'admin')
ADMIN_PASS = os.environ.get('HIDCHE_PASSWORD', 'admin123')
PW_SALT = os.environ.get('HIDCHE_PW_SALT', 'default_salt_change_me')
DB_PREFIX = os.environ.get('HIDCHE_DB_PREFIX', 'hidche')

def wait_for_services():
    """Wait for dependent services to be ready."""
    print("[WAIT] Waiting for services to be ready...")
    
    max_attempts = 60
    for attempt in range(max_attempts):
        try:
            # Check if nginx is ready
            response = requests.get('http://legacy-nginx/health', timeout=5)
            if response.status_code == 200:
                print("[OK] Nginx is ready")
                return True
        except Exception:
            pass
        
        print(f"[WAIT] Attempt {attempt + 1}/{max_attempts}...")
        time.sleep(5)
    
    print("[ERROR] Services did not become ready in time")
    return False

def check_already_installed():
    """Check if the game is already installed."""
    config_file = '/var/www/html/f_config/config.php'
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            content = f.read()
            if 'DB_HOST' in content and 'INSTALLED' in content:
                return True
    return False

def run_installation():
    """Run the installation process."""
    print("[INSTALL] Starting installation...")
    
    try:
        # Call the installation API
        install_url = f"{GAME_PATH}/f_install/install.php"
        
        data = {
            'admin': ADMIN_USER,
            'password': ADMIN_PASS,
            'pw_salt': PW_SALT,
            'db_prefix': DB_PREFIX,
            'action': 'install'
        }
        
        response = requests.post(install_url, data=data, timeout=300)
        
        if response.status_code == 200:
            print("[OK] Installation completed successfully")
            return True
        else:
            print(f"[ERROR] Installation failed: {response.status_code}")
            print(response.text[:500])
            return False
            
    except Exception as e:
        print(f"[ERROR] Installation exception: {e}")
        return False

def main():
    print("=" * 50)
    print("HiDCHe Game Server Installation")
    print("=" * 50)
    
    # Check if already installed
    if check_already_installed():
        print("[SKIP] Game is already installed. Exiting.")
        return
    
    # Wait for services
    if not wait_for_services():
        print("[ABORT] Cannot proceed without services")
        return
    
    # Run installation
    if run_installation():
        print("[DONE] Installation completed!")
    else:
        print("[FAILED] Installation failed. Check logs for details.")

if __name__ == '__main__':
    main()
