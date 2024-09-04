package wshelpers

import (
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Void interface{}

type ConnectionsSet map[*websocket.Conn]Void

func (c ConnectionsSet) Add(conn *websocket.Conn) {
	_, ok := c[conn]
	if !ok {
		c[conn] = new(Void)
	}
}
func (c ConnectionsSet) Remove(conn *websocket.Conn) {
	_, ok := c[conn]
	if !ok {
		return
	}

	delete(c, conn)
}

type ConnectionsForID struct {
	Mu          sync.Mutex
	Connections map[int]ConnectionsSet
}
