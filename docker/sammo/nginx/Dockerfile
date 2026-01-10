FROM nginx:alpine
COPY docker/sammo/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/sammo/nginx/maintenance.html /usr/share/nginx/html/maintenance.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
