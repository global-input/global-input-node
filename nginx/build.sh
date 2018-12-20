export working_dir=./package/target/nginx

mkdir -p $working_dir

rsync -azvv ./nginx/ $working_dir/

cd ../global-input-web

yarn build

cd -
rsync -azvv  ../global-input-web/build/ $working_dir/data/websites/globalinput/
rsync -azvv  ../global-input-web/build/ $working_dir/var/www/html/

cd $working_dir
pwd

docker build -t dilshat/global_input_nginx .
