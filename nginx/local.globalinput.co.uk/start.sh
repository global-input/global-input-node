docker stop globalinput_nginx
docker container rm  globalinput_nginx
docker run -d --name globalinput_nginx -p 80:80 -p 443:443  -t dilshat/local.globalinput.co.uk
