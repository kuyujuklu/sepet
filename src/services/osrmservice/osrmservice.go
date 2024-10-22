package osrmservice

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/alexkalak/qrmenu/src/errors/osrmerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/shared/entities/osrmentities"
)

type OsrmService interface {
	GetDistanceToPubs(originLat, originLng float64, pubs []models.Pub) ([]int, error)
}

type osrmService struct {
	DrivingRequestPath string
}

func New() OsrmService {
	return &osrmService{
		DrivingRequestPath: os.Getenv("OSRM_API_DRIVING_PATH"),
	}
}

func (s *osrmService) GetDistanceToPubs(originLat, originLng float64, pubs []models.Pub) ([]int, error) {
	if len(pubs) == 0 {
		return []int{}, nil
	}

	//ATTENTION: osrm api receives info like lng,lat
	queryString := fmt.Sprintf("%f,%f", originLng, originLat)
	for _, pub := range pubs {
		queryString += ";" + fmt.Sprintf("%f,%f", pub.Lng, pub.Lat)
	}
	queryString += "?sources=0&annotations=distance"

	url := s.DrivingRequestPath + queryString

	fmt.Println("osrm url: " + url)

	client := http.Client{
		Timeout: 3 * time.Second,
	}
	resp, err := client.Get(url)

	if err != nil {
		return nil, err
	}

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {

		fmt.Println("Osrm unreadable body in response")
		return nil, osrmerrors.ErrOsrmBadResponse
	}
	fmt.Println("osrm response struct: ", string(respBytes))

	responseStruct := osrmentities.OsrmRespose{}
	json.Unmarshal(respBytes, &responseStruct)

	if len(responseStruct.Distances) == 0 {
		fmt.Println("Osrm 0 length of response distances")
		return nil, osrmerrors.ErrOsrmBadResponse
	}

	if len(responseStruct.Distances[0]) == 0 {
		fmt.Println("Osrm 0 length of response first array in distances")
		return nil, osrmerrors.ErrOsrmBadResponse
	}

	// +1 because osrm api return 0 for first distance
	if len(responseStruct.Distances[0]) != len(pubs)+1 {
		fmt.Println("Osrm not enough distances")
		return nil, osrmerrors.ErrOsrmBadResponse
	}

	result := make([]int, 0, len(pubs))

	for i := range responseStruct.Distances[0] {
		if i == 0 {
			continue
		}

		result = append(result, int(responseStruct.Distances[0][i]))
	}

	return result, nil
}
