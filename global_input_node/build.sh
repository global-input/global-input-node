export working_dir=./package/target/global_input_node

mkdir -p $working_dir

rsync -azvv ./global_input_node/ $working_dir/
rsync -azvv ./app/ $working_dir/app/

cd $working_dir/app/

cd -

cd $working_dir

docker build -t dilshat/global_input_node .
