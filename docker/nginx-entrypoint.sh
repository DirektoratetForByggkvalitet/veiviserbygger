#!/bin/sh

# Ensure PORT is set (Heroku provides it, but a default is good for local testing)
PORT=${PORT:-80}

# # Debugging: Print the PORT value to verify it’s set
echo "Using PORT: $PORT"

# # Replace ${PORT} in the template with the actual PORT value using sed
sed -e "s/<PORT>/$PORT/g" \
    -e "s/<PROJECT_ID>/$PUBLIC_FIREBASE_PROJECT_ID/g" \
    /etc/nginx/nginx.conf.template  > /etc/nginx/nginx.conf

# # Display the final configuration
cat /etc/nginx/nginx.conf

# Start the API server (in the background) using the PORT value
PORT=3000 npm run start --workspace=api &

# Start Nginx
exec nginx -g 'daemon off;'
