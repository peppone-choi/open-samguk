# Cron Service for Legacy Game Turn Processing
# Based on: https://storage.hided.net/gitea/devsam/docker/hidche/cron

FROM python:3-alpine

# Install required packages
RUN apk add --no-cache curl bash

# Copy entrypoint
COPY docker/legacy/cron/entrypoint.sh /entrypoint.sh
COPY docker/legacy/cron/crontab /etc/crontabs/root

RUN chmod +x /entrypoint.sh

VOLUME /var/www/html

ENTRYPOINT ["/entrypoint.sh"]
