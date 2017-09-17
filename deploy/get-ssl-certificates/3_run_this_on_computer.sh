
rsync -azvv root@globalinput.co.uk:/root/global-input-node/nginx/etc/update/letsencrypt/ /Users/dilshathewzulla/workspace/global-input/global-input-secrets/prod/letsencrypt/
rsync -azvv root@globalinput.co.uk:/root/global-input-node/nginx/etc/update/node4567/ /Users/dilshathewzulla/workspace/global-input/global-input-secrets/prod/node4567/letsencrypt/
scp root@globalinput.co.uk:/root/global-input-node/nginx/etc/update/globalinput.co.uk /Users/dilshathewzulla/workspace/global-input/global-input-node/nginx/etc/nginx/sites-available/
