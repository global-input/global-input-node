docker rm -f global_input_messenger
#docker run --network=iterativesolution_default --name global_input_messenger -p 1337:1337 -t dilshat/global_input_messenger 
docker-compose build
docker-compose up