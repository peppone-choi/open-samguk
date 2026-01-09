FROM alpine:latest
RUN apk add --no-cache postgresql-client
WORKDIR /backup
COPY . .
# Simple loop or cron could go here
CMD ["echo", "Backup service started"]
