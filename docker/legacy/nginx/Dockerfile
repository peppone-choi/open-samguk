# Nginx for Legacy PHP Application
# Based on: https://storage.hided.net/gitea/devsam/docker/hidche/web

FROM nginx:alpine

ARG UID=33
ARG GID=33

# Adjust nginx user UID/GID if needed
RUN if [ "$UID" != "33" ]; then \
      apk add shadow; \
      usermod -u $UID -o nginx; \
    fi; \
    if [ "$GID" != "33" ]; then \
      apk add shadow; \
      groupmod -g $GID -o nginx; \
    fi

# Copy nginx configuration
COPY docker/legacy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/legacy/nginx/sam.conf /etc/nginx/snippets/sam.conf

# Create volume mount points
VOLUME /var/www/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/health || exit 1
