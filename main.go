package main

import (
	"fmt"
	"log"
	"os"
	"time"

	httpv1 "github.com/alexkalak/qrmenu/src/controllers/httpv1/routes"
	"github.com/alexkalak/qrmenu/src/controllers/ws"
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo"
	"github.com/alexkalak/qrmenu/src/services/pushcampaignservice"
	"github.com/alexkalak/qrmenu/src/services/telegramservice"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	"github.com/joho/godotenv"

	_ "github.com/alexkalak/qrmenu/docs"
)

//@title QrMenuApi
//@version 1.0
//@description simple description

func main() {
	// configure
	loadEnv()
	configureTime()
	configure()
	initiatePostgresDB()
	configureTelegram()
	startPushCampaignBackgroundLoops()

	// create app
	app := createApp()
	setupRoutes(app)
	configureSWAG(app)
	configureFileSystem(app)

	// print time in console
	fmt.Println("Time Now: ", time.Now().Format("2006-01-02 15:04:05"))

	// start app
	log.Fatal(app.Listen(":" + getPort()))
}

func loadEnv() {
	godotenv.Load()
}

func configureTime() {
	time.Local = time.UTC
}

func configure() {
	configureLogs()
	configureRepos()
	models.ConfigureVariables()
}

func configureSWAG(app *fiber.App) {
	app.Get("/swagger/*", swagger.HandlerDefault)
}

func initiatePostgresDB() {
	if db := postgresql.InitializeDatabase(); db == nil {
		log.Fatal("Failed to connect to database")
		time.Sleep(2 * time.Second)
		initiatePostgresDB()
	}
}

func configureTelegram() {
	_, err := telegramservice.New()
	if err != nil {
		panic(err)
	}
}

// First at-boot background loops in this codebase - every prior periodic
// job (wsutils.SendPing) is spawned per-connection, not once at startup.
// Scheduler fires campaigns whose scheduled_at has arrived; ReceiptPoller
// exchanges Expo send tickets for real delivery receipts (the vendored SDK
// has no receipt method of its own, see pushcampaignservice).
func startPushCampaignBackgroundLoops() {
	service := pushcampaignservice.New()
	go service.RunScheduler()
	go service.RunReceiptPoller()
}

func configureLogs() {
	file, err := os.OpenFile("logs.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o777)
	if err != nil {
		log.Fatal(err)
	}

	logsConfig := logs.LogsConfig{
		Info:     file,
		Errors:   file,
		Warnings: file,
	}

	logs.Configure(logsConfig)
}

func configureRepos() {
	repo.Configure()
}

func configureFileSystem(app *fiber.App) {
	app.Static("/static", "clientfiles")
}

func getPort() string {
	port := os.Getenv("PORT")

	if port == "" {
		return "80"
	}

	return port
}

func createApp() *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: 20 * 1024 * 1024, // 20MB
	})

	app.Use(cors.New())

	setupRoutes(app)

	return app
}

func setupRoutes(app *fiber.App) {
	app.Route("/api", httpv1.Router)
	app.Route("/ws", ws.Router)
	app.Get("/", func(c *fiber.Ctx) error { return c.SendFile("index.html") })
}
