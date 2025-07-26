FROM nginx
COPY admin-build/ /var/www/qrmenu/admin
COPY .well-known/ /var/www/qrmenu/.well-known
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d /etc/nginx/conf.d

