FROM nginx

ENV SERVER_URI=http://route-mapper-back-end:8080

COPY dist/route-mapper-web/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.template

EXPOSE 80

CMD envsubst '\$SERVER_URI' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'
