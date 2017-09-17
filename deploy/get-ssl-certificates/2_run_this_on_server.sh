mkdir /root/global-input-node/nginx/etc/update
cd /root/global-input-node/nginx/etc/update
docker cp nginx:/etc/letsencrypt letsencrypt
docker cp nginx:/etc/node4567 node4567
docker cp nginx:/etc/nginx/sites-available/globalinput.co.uk globalinput.co.uk
