FROM nginx
COPY admin-build/ /var/www/qrmenu/admin
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d /etc/nginx/conf.d

