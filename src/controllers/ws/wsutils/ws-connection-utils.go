package wsutils

import (
	"fmt"
	"time"

	"github.com/gofiber/contrib/websocket"
)

type Message struct {
	MessageType int
	Message     []byte
}

func ReadConnMessages(conn *websocket.Conn, message chan<- Message, closed chan<- bool) {
	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error message ", err)
			closed <- true
			break
		}

		message <- Message{
			MessageType: mt,
			Message:     msg,
		}
	}
}

func SendPing(conn *websocket.Conn, gotPong <-chan bool, closed chan<- bool) {
	pingTicker := time.NewTicker(10 * time.Second)

	for range pingTicker.C {
		err := conn.WriteMessage(websocket.TextMessage, []byte(PingMessage))
		if err != nil {
			closed <- true
			return
		}
		go CloseConnectionIfThereWillBeNoPong(conn, gotPong, closed, pingTicker, time.Second*9)
	}
}

func CloseConnectionIfThereWillBeNoPong(conn *websocket.Conn, gotPong <-chan bool, closed chan<- bool, pingTicker *time.Ticker, duration time.Duration) {
	ticker := time.NewTicker(duration)
	for {
		select {
		case b := <-gotPong:
			if b {
				return
			}
		case t := <-ticker.C:
			fmt.Println("pong ticker for closing connection: ", t)
			if conn != nil {
				closed <- true
			}

			ticker.Stop()

			if pingTicker != nil {
				pingTicker.Stop()
			}
			return
		}
	}
}
