export working_dir=./package/target/nginx
export working_web=./package/target/local.globalinput.co.uk

mkdir -p $working_dir
mkdir -p $working_web

rsync -azvv ./nginx/ $working_dir/

rsync -azvv ../global-input-web/ $working_web/
rsync -azvv nginx/local.globalinput.co.uk/configs/ $working_web/src/configs/

cd $working_web/

yarn build

cd -
rsync -azvv  $working_web/build/ $working_dir/data/websites/globalinput/
rsync -azvv  $working_web/build/ $working_dir/var/www/html/

cd $working_dir
pwd

docker build -t dilshat/local.globalinput.co.uk .
