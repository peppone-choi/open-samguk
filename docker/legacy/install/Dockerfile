# Install Service for Legacy Game Server
# Performs initial setup and configuration
# Based on: https://storage.hided.net/gitea/devsam/docker/hidche/install

FROM python:3-alpine

# Install required packages
RUN pip3 install requests && \
    rm -r /root/.cache && \
    apk add --no-cache curl bash git

# Copy install script
COPY docker/legacy/install/install_hidche.py /bin/install_hidche.py
RUN chmod +x /bin/install_hidche.py

VOLUME /var/www/html

CMD ["python3", "/bin/install_hidche.py"]
