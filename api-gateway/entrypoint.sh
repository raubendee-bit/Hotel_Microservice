#!/usr/bin/env sh
set -e

# Substitute known service URL env vars into the nginx template
envsubst '\$AUTH_SERVICE_URL \$BOOKING_SERVICE_URL \$FINANCE_SERVICE_URL \$HOUSEKEEPING_SERVICE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
