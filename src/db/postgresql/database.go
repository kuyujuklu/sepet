package postgresql

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/alexkalak/qrmenu/src/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var database *gorm.DB

func Init() *gorm.DB {
	godotenv.Load()
	dbUser := os.Getenv("DB_USR")
	dbPass := os.Getenv("DB_PASS")
	dbServ := os.Getenv("DB_SERV")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// dsn := fmt.Sprintf("root:rootroot@tcp(localhost:3306)/pony_express_dev?charset=utf8mb4&parseTime=True&loc=Local")
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", dbServ, dbUser, dbPass, dbName, dbPort)
	fmt.Println(dsn)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
		return nil
	}

	//asd
	db.AutoMigrate(
		&models.Company{},
		&models.Pub{},
		&models.Currency{},
		&models.Menu{},
		&models.Category{},
		&models.Dish{},
		&models.Role{},
		&models.Admin{},
	)
	return db
}

func GetDB() *gorm.DB {
	if database == nil {
		database = Init()
		for database == nil {
			var sleep = time.Second
			sleep = sleep * 2
			fmt.Printf("database id unvaliable. Wait for %s seconds \n", sleep.String())

			time.Sleep(sleep)
		}
	}
	return database
}
