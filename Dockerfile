# Stage 1: Build the application
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install NGINX in the final stage
RUN apk add --no-cache nginx envsubst 

# Copy the Nginx template file
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template

# Copy the entrypoint script
COPY docker/nginx-entrypoint.sh /usr/local/bin/nginx-entrypoint.sh
RUN chmod +x /usr/local/bin/nginx-entrypoint.sh

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Copy the package.json for the different apps
RUN mkdir -p apps/web apps/api
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/

# # Install all dependencies for the monorepo
RUN npm ci

# Copy the rest of the project files
COPY . .

# Run the build command for the TurboRepo project
RUN npm run build --filter=web --filter=api

# Copy web files to the NGINX directory
RUN mkdir -p /usr/share/nginx/html
RUN cp -r apps/web/dist/* /usr/share/nginx/html
RUN ls -la /usr/share/nginx/html

ENTRYPOINT ["sh", "-c", "/usr/local/bin/nginx-entrypoint.sh"]
