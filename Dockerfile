FROM golang:1.21.8-alpine3.19

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY .  .

RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

EXPOSE ${PORT}

CMD ["/docker-gs-ping"]
