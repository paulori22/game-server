#!/bin/sh
set -e
app=/home/node/app
uid=${HOST_UID:-1000}
gid=${HOST_GID:-1000}
mkdir -p "$app/node_modules" "$app/dist"
chown -R "${uid}:${gid}" "$app/node_modules" "$app/dist"
exec su-exec "${uid}:${gid}" "$@"
