#!/bin/sh

cat << EOF
+-------------------------------+
|  V E I V I S E R B Y G G E R  |
+-------------------------------+

A Losen-compliant wizard builder,
run in a tiny OCI container

EOF
# Replace environment variables in the nginx config template using sed
sed -e "s/\${WEB_PORT}/$WEB_PORT/g" \
    -e "s/\${PUBLIC_FIREBASE_APP_ID}/$PUBLIC_FIREBASE_APP_ID/g" \
    -e "s/\${LOCAL_PORT}/$LOCAL_PORT/g" \
    /etc/nginx/nginx.conf.template  > /etc/nginx/nginx.conf

# Showing the final nginx.conf
echo "## debug: nginx config ##"
cat /etc/nginx/nginx.conf
echo "## end config ##"
echo ""
echo "Starting the application..."

# Start the API server (in the background) using the PORT value
touch api/.env
PORT=${LOCAL_PORT} npm run start --workspace=api &

# Start Nginx
echo "Starting nginx..."
exec nginx
