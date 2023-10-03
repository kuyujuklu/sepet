docker:
	sudo docker build -t alexkalak/qr-front . 
docker-push:
	sudo make docker
	sudo docker push alexkalak/qr-front

