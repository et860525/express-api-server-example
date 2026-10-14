FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends cron tzdata \
  && rm -rf /var/lib/apt/lists/*

COPY backup.sh /backup.sh
COPY crontab /etc/cron.d/uploads-backup

RUN chmod +x /backup.sh \
  && chmod 0644 /etc/cron.d/uploads-backup \
  && touch /var/log/backup.log

CMD ["cron", "-f"]
