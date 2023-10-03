default:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0  go build -o main main.go 

docker:
	sudo docker build -t alexkalak/qr-back .
docker-push:
	sudo make docker
	sudo docker push alexkalak/qr-back
