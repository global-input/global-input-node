export working_dir=./package/target/qr_code_node

mkdir -p $working_dir

rsync -azvv ./qr_code_node/ $working_dir/
rsync -azvv ./qr-code-app/ $working_dir/qr-code-app/

cd $working_dir/qr-code-app/

cd -

cd $working_dir

docker build -t dilshat/qr_code_node .
