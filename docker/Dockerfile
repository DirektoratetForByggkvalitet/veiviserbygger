# Stage 1: Build the application
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install NGINX in the final stage
RUN apk add nginx

# Set up NGINX configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy the package.json and package-lock.json to install dependencies
COPY ../package.json ../package-lock.json ./

# Install all dependencies for the monorepo
RUN npm install

# Copy the rest of the project files
COPY .. .

# Run the build command for the TurboRepo project
RUN npm run build --filter=web --filter=api

# Copy web files to the NGINX directory
RUN mkdir -p /usr/share/nginx/html
RUN cp -r apps/web/dist/* /usr/share/nginx/html
RUN ls -la /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["sh", "-c", "(nginx -g 'daemon off;' & PORT=3000 npm run start --workspace=api)"]
