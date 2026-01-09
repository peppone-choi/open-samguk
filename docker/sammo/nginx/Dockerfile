FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/maintenance.html /usr/share/nginx/html/maintenance.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
