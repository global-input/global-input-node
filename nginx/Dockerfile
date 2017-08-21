FROM ubuntu:16.04
LABEL maintainer dilshat@iterativesolution.co.uk

# basic & nginx

RUN apt-get update  && apt-get install -y curl git nginx
RUN rm -v /etc/nginx/nginx.conf
ADD etc/nginx/nginx.conf /etc/nginx/
ADD etc/nginx/sites-available /etc/nginx/sites-available
ADD etc/letsencrypt /etc/letsencrypt
ADD etc/node4567 /etc/node4567
RUN rm -rf /var/www/html/index.nginx-debian.html

RUN ln -s /etc/nginx/sites-available/globalinput.co.uk /etc/nginx/sites-enabled/globalinput.co.uk



ADD data/websites/globalinput /data/websites/globalinput

ADD etc/nginx/esb /etc/nginx/esb

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
