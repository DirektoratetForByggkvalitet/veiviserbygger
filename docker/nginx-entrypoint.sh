#!/bin/sh

echo << EOF
+-------------------------------+
|  V E I V I S E R B Y G G E R  |
+-------------------------------+

A Losen-compliant wizard builder,
run in a tiny OCI container

EOF
# Replace environment variables in the nginx config template
envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
# Showing the final nginx.conf
echo "## debug: nginx config ##"
cat /etc/nginx/nginx.conf
echo "## end config ##"
echo ""
echo "Starting the application..."

# Start the API server (in the background) using the PORT value
PORT=3000 npm run start --workspace=api &
echo "Starting nginx..."
# Start Nginx
exec nginx -g 'daemon off;'
