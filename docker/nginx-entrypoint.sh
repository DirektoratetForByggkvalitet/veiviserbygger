#!/bin/sh

# Ensure PORT is set (Heroku provides it, but a default is good for local testing)
PORT=${PORT:-80}

# Debugging: Print the PORT value to verify it’s set
echo "Using PORT: $PORT"

# Replace ${PORT} and ${PUBLIC_FIREBASE_PROJECT_ID} in the template with the actual values
sed -e "s/\${PORT}/$PORT/g" \
    -e "s/\${PUBLIC_FIREBASE_PROJECT_ID}/$PUBLIC_FIREBASE_PROJECT_ID/g" \
    /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Display the final configuration
cat /etc/nginx/nginx.conf

# Start the API server (in the background) using the PORT value
PORT=3000 npm run start --workspace=api &

# Start Nginx
exec nginx -g 'daemon off;'
