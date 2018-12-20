docker container rm  qr_code_node
docker run -d --name qr_code_node -p 1338:1338   -t dilshat/qr_code_node
