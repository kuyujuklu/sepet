package smsservice

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/shared/entities/infobipentities"
)

type SmsService interface {
	CreateVerificationSession(phone string) (string, error)
	CheckVerificationCode(pinID, code string) error
}

// type twilioAuthData struct {
// 	Username  string
// 	Password  string
// 	ServiceID string
// }

type smsService struct {
	// twilioAuthCode string
	// MainAccount    twilioAuthData
	// SecondAccount  twilioAuthData
	// ThirdAccount   twilioAuthData
	// FourthAccount  twilioAuthData

	AuthToken     string
	ApplicationID string
	MessageID     string
}

func New() SmsService {
	return &smsService{
		// MainAccount: twilioAuthData{
		// 	Username:  "AC7e4141ca6329d26eae5a310b43e33bed",
		// 	Password:  "70c124054b3aff605e3e12f1957ceaf1",
		// 	ServiceID: "VA09619522c008c8e235863f0ecdf5e7d1",
		// },
		// SecondAccount: twilioAuthData{
		// 	Username:  "AC796d80b937c89364fbd2d7dda42374a4",
		// 	Password:  "71c0b6d38752811677b1109797d9fb47",
		// 	ServiceID: "VA3345b34cc79f6e12dbaff8d85362f4f6",
		// },
		// ThirdAccount: twilioAuthData{
		// 	Username:  "ACaf79a4b255e51d236c7bf3d851d2612b",
		// 	Password:  "b0ac6230536c685a26e0efde687e1705",
		// 	ServiceID: "VAcd23d4b64e44194b63d60e1851037f33",
		// },
		// FourthAccount: twilioAuthData{
		// 	Username:  "ACbb44a36b90b62c9a2abc6c24ed1cb2c3",
		// 	Password:  "a94364ff765d7c765321b36fc21cbc00",
		// 	ServiceID: "VA628488e24ea39cf9889268a827242606",
		// },
		AuthToken:     os.Getenv("INFO_BIP_AUTH_TOKEN"),
		ApplicationID: os.Getenv("INFO_BIP_APPLICATION_ID"),
		MessageID:     os.Getenv("INFO_BIP_MESSAGE_ID"),
	}
}

func (s *smsService) CreateVerificationSession(phone string) (string, error) {
	url := "https://d9lgz8.api.infobip.com/2fa/2/pin"
	method := "POST"

	payloadStruct := infobipentities.DeliverMessageBody{
		ApplicationID: s.ApplicationID,
		MessageID:     s.MessageID,
		To:            phone,
	}

	payload, err := json.MarshalIndent(payloadStruct, "", "\n")
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))

	if err != nil {
		fmt.Println(err)
		return "", err
	}
	req.Header.Add("Authorization", "App "+s.AuthToken)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	respStruct := infobipentities.DeliverMessageResponse{}
	err = json.Unmarshal(body, &respStruct)
	if err != nil {
		return "", err
	}

	fmt.Println("create verification from sms api: ", helpers.ConvertToJSON(respStruct))

	return respStruct.PinID, nil
}

func (s *smsService) CheckVerificationCode(pinID, code string) error {
	url := fmt.Sprintf("https://d9lgz8.api.infobip.com/2fa/2/pin/%s/verify", pinID)
	method := "POST"

	payloadStruct := infobipentities.VerifyMessageBody{
		Pin: code,
	}

	payload, err := json.MarshalIndent(payloadStruct, "", "\n")
	if err != nil {
		return err
	}

	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))

	if err != nil {
		fmt.Println(err)
		return err
	}
	req.Header.Add("Authorization", "App "+s.AuthToken)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return err
	}

	respStruct := infobipentities.VerifyMessageResponse{}

	err = json.Unmarshal(body, &respStruct)
	if err != nil {
		return err
	}

	fmt.Println("check verification from sms api: ", helpers.ConvertToJSON(respStruct))

	return nil
}
