docker rm -f global_input_node
#docker run --network=iterativesolution_default --name global_input_node -p 1337:1337 -t dilshat/global_input_node
docker-compose build
docker-compose up
