#!/bin/sh

# Replace ${PORT} in the template with the actual PORT env variable
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
exec nginx -g 'daemon off;'
