docker stop global_input_node
docker container rm  global_input_node
docker run -d --name global_input_node -p 1337:1337   -t dilshat/global_input_node
