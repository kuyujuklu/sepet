default:
	echo "for docker build select make doc"
doc:
	sudo docker build -t alexkalak/qr-nginx .
