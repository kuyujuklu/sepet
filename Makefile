default:
	echo "for docker build select make doc"
docker:
	sudo docker build -t alexkalak/qr-nginx .
docker-push:
	sudo make docker
	sudo docker push alexkalak/qr-nginx	
