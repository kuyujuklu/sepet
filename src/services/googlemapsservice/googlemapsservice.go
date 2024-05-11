package googlemapsservice

import (
	"context"
	"fmt"

	"github.com/alexkalak/qrmenu/src/errors/googlemapserrors"
	"github.com/alexkalak/qrmenu/src/models"
	"googlemaps.github.io/maps"
)

type GoogleMapsService interface {
	GetDistanceToPubs(ctx context.Context, originLat, originLng float64, pubs []models.Pub) ([]int, error)
}

type googleMapsService struct{}

func New() GoogleMapsService {
	return &googleMapsService{}
}

func (s *googleMapsService) GetDistanceToPubs(ctx context.Context, originLat, originLng float64, pubs []models.Pub) ([]int, error) {
	if len(pubs) == 0 {
		return []int{}, nil
	}

	origins := []string{
		fmt.Sprintf("%f,%f", originLat, originLng),
	}

	destinations := make([]string, 0, len(pubs))
	for _, pub := range pubs {
		destinations = append(destinations, fmt.Sprintf("%f,%f", pub.Lat, pub.Lng))
	}

	r := &maps.DistanceMatrixRequest{
		Origins:      origins,
		Destinations: destinations,
	}

	c, err := maps.NewClient(maps.WithAPIKey("AIzaSyDewxZSRZGrEek6CmiGGi2ps2CNlZIr8Qc"))
	if err != nil {
		return nil, err
	}

	resp, err := c.DistanceMatrix(ctx, r)
	if err != nil {
		return nil, err
	}
	if len(resp.Rows) == 0 {
		return nil, googlemapserrors.ErrUnknownError
	}

	result := make([]int, 0, len(pubs))

	for _, element := range resp.Rows[0].Elements {
		result = append(result, element.Distance.Meters)
	}

	return result, nil
}
