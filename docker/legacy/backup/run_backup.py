#!/usr/bin/env python3
"""
Database Backup Script for Legacy Game Server
Based on: https://storage.hided.net/gitea/devsam/docker/hidche/backup
"""

import os
import subprocess
import datetime
import glob

# Configuration from environment
DB_HOST = os.environ.get('DB_HOST', 'legacy-db')
DB_USER = os.environ.get('DB_USER', 'sammo')
DB_PASS = os.environ.get('DB_PASS', '')
BACKUP_DIR = '/var/backup'
RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', '7'))

# Databases to backup
DATABASES = ['sammo_game', 'sammo_common']

def backup_database(db_name: str) -> bool:
    """Backup a single database."""
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f"{BACKUP_DIR}/{db_name}_{timestamp}.sql.gz"
    
    try:
        # Create mysqldump command
        cmd = [
            'mysqldump',
            f'--host={DB_HOST}',
            f'--user={DB_USER}',
            f'--password={DB_PASS}',
            '--single-transaction',
            '--routines',
            '--triggers',
            db_name
        ]
        
        # Execute and compress
        with open(backup_file, 'wb') as f:
            dump = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            gzip = subprocess.Popen(['gzip'], stdin=dump.stdout, stdout=f)
            dump.stdout.close()
            gzip.communicate()
        
        if gzip.returncode == 0:
            print(f"[OK] Backup created: {backup_file}")
            return True
        else:
            print(f"[ERROR] Failed to backup {db_name}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Exception during backup of {db_name}: {e}")
        return False

def cleanup_old_backups():
    """Remove backups older than retention period."""
    cutoff = datetime.datetime.now() - datetime.timedelta(days=RETENTION_DAYS)
    
    for pattern in ['*.sql.gz', '*.sql']:
        for backup_file in glob.glob(f"{BACKUP_DIR}/{pattern}"):
            file_time = datetime.datetime.fromtimestamp(os.path.getmtime(backup_file))
            if file_time < cutoff:
                try:
                    os.remove(backup_file)
                    print(f"[CLEANUP] Removed old backup: {backup_file}")
                except Exception as e:
                    print(f"[ERROR] Failed to remove {backup_file}: {e}")

def main():
    print(f"[START] Backup started at {datetime.datetime.now()}")
    
    # Create backup directory if not exists
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # Backup each database
    success_count = 0
    for db in DATABASES:
        if backup_database(db):
            success_count += 1
    
    # Cleanup old backups
    cleanup_old_backups()
    
    print(f"[DONE] Backup completed. {success_count}/{len(DATABASES)} databases backed up.")

if __name__ == '__main__':
    main()
