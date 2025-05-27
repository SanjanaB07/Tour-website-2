# Use an official Nginx image
FROM nginx:alpine

# Copy static files into Nginx html folder
COPY . /usr/share/nginx/html

EXPOSE 80
