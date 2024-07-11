default:
	echo "for docker build select make doc"
docker:
	sudo docker build -t alexkalak/qr-nginx .
docker-push:
	sudo make docker
	sudo docker push alexkalak/qr-nginx	
admin-build:
	npm run build --prefix ../admin-front
	sudo rm -r ./admin-build
	cp -r ../admin-front/build ./admin-build
admin-push:
	make -iB admin-build
	sudo make docker-push

