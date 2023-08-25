package main

import (
	"log"
	"os"

	httpv1 "github.com/alexkalak/qrmenu/src/controllers/httpv1/routes"
	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/logs"
	"github.com/alexkalak/qrmenu/src/repo"
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
	loadEnv()
	configure()
	initiatePostgresDB()

	app := createApp()
	setupRoutes(app)
	configureSWAG(app)
	configureFileSystem(app)

	log.Fatal(app.Listen(":" + getPort()))
}

func loadEnv() {
	if err := godotenv.Load(); err != nil {
		panic("No .env file found")
	}
}

func configure() {
	configureLogs()
	configureRepos()
}

func configureSWAG(app *fiber.App) {
	app.Get("/swagger/*", swagger.HandlerDefault)
}

func initiatePostgresDB() {
	postgresql.Init()
}

func configureLogs() {
	file, err := os.OpenFile("logs.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0777)
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
		return "9999"
	}

	return port
}

func createApp() *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: 20 * 1024 * 1024, //20MB
	})

	app.Use(cors.New())

	setupRoutes(app)

	return app
}

func setupRoutes(app *fiber.App) {
	app.Route("/", httpv1.Router)
}
