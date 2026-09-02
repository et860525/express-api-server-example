FROM mariadb:latest

RUN apt-get update \
  && apt-get install -y --no-install-recommends cron tzdata gzip \
  && rm -rf /var/lib/apt/lists/*

COPY backup.sh /backup.sh
COPY entrypoint.sh /entrypoint.sh
COPY crontab /etc/cron.d/db-backup

RUN chmod +x /backup.sh /entrypoint.sh \
  && chmod 0644 /etc/cron.d/db-backup \
  && touch /var/log/backup.log

ENTRYPOINT ["/entrypoint.sh"]
CMD ["cron", "-f"]
