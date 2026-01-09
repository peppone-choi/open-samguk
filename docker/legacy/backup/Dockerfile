# Backup Service for Legacy Database
# Based on: https://storage.hided.net/gitea/devsam/docker/hidche/backup

FROM python:3-alpine

# Install required packages
RUN apk add --no-cache mariadb-client rsync bash gzip

# Copy backup script
COPY docker/legacy/backup/run_backup.py /usr/local/bin/run_backup.py
RUN chmod +x /usr/local/bin/run_backup.py

# Setup cron for daily backup at 5 AM
RUN echo '0 5 * * * python3 /usr/local/bin/run_backup.py >> /var/log/backup.log 2>&1' > /etc/crontabs/root

# Create backup directory
RUN mkdir -p /var/backup

VOLUME /var/www/html
VOLUME /var/backup

ENTRYPOINT []
CMD ["crond", "-f", "-L", "/dev/stdout"]
