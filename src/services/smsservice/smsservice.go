package smsservice

import (
	"errors"
	"fmt"
	"os"

	"github.com/alexkalak/qrmenu/src/errors/smserrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/twilio/twilio-go"
	verify "github.com/twilio/twilio-go/rest/verify/v2"
)

type SmsService interface {
	CreateVerificationSession(phone string) (string, error)
	CheckVerificationCode(verificationSession, phone, code string) error
}

type twilioAuthData struct {
	Username  string
	Password  string
	ServiceID string
}

type smsService struct {
	// twilioAuthCode string
	MainAccount twilioAuthData
	// SecondAccount  twilioAuthData
	// ThirdAccount   twilioAuthData
	// FourthAccount  twilioAuthData

	AuthToken     string
	ApplicationID string
	MessageID     string
}

func New() SmsService {
	return &smsService{
		MainAccount: twilioAuthData{
			Username:  "ACf084f5f09f575e36756abfc0f4ffb3e0",
			Password:  "f93b09c6f905d51c2772578fbf820021",
			ServiceID: "VA4642ab28116637fab0c8ea0d2cbab01c",
		},
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
	// url := "https://d9lgz8.api.infobip.com/2fa/2/pin"
	// method := "POST"

	// payloadStruct := infobipentities.DeliverMessageBody{
	// 	ApplicationID: s.ApplicationID,
	// 	MessageID:     s.MessageID,
	// 	To:            phone,
	// }

	// payload, err := json.MarshalIndent(payloadStruct, "", "\n")
	// if err != nil {
	// 	return "", err
	// }

	// client := &http.Client{}
	// req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))

	// if err != nil {
	// 	fmt.Println(err)
	// 	return "", err
	// }
	// req.Header.Add("Authorization", "App "+s.AuthToken)
	// req.Header.Add("Content-Type", "application/json")
	// req.Header.Add("Accept", "application/json")

	// res, err := client.Do(req)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return "", err
	// }
	// defer res.Body.Close()

	// body, err := io.ReadAll(res.Body)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return "", err
	// }

	// respStruct := infobipentities.DeliverMessageResponse{}
	// err = json.Unmarshal(body, &respStruct)
	// if err != nil {
	// 	return "", err
	// }

	// fmt.Println("create verification from sms api: ", helpers.ConvertToJSON(respStruct))

	// return respStruct.PinID, nil

	clientParams := twilio.ClientParams{
		Username: s.MainAccount.Username,
		Password: s.MainAccount.Password,
	}

	client := twilio.NewRestClientWithParams(clientParams)

	params := &verify.CreateVerificationParams{}
	params.SetTo(phone) //"+37376797591"
	params.SetChannel("sms")

	resp, err := client.VerifyV2.CreateVerification("VA4642ab28116637fab0c8ea0d2cbab01c", params)
	if err != nil {
		fmt.Println(err.Error())
		return "", smserrors.ErrUnableToSendSms
	} else {
		if resp.Sid == nil {
			fmt.Println(helpers.ConvertToJSON(resp))
			return "", errors.New("no sid in response")
		} else {
			fmt.Println(helpers.ConvertToJSON(resp))
		}
	}

	return *resp.Sid, nil
}

func (s *smsService) CheckVerificationCode(verificationSession, phone, code string) error {
	// url := fmt.Sprintf("https://d9lgz8.api.infobip.com/2fa/2/pin/%s/verify", pinID)
	// method := "POST"

	// payloadStruct := infobipentities.VerifyMessageBody{
	// 	Pin: code,
	// }

	// payload, err := json.MarshalIndent(payloadStruct, "", "\n")
	// if err != nil {
	// 	return err
	// }

	// client := &http.Client{}
	// req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))

	// if err != nil {
	// 	fmt.Println(err)
	// 	return err
	// }
	// req.Header.Add("Authorization", "App "+s.AuthToken)
	// req.Header.Add("Content-Type", "application/json")
	// req.Header.Add("Accept", "application/json")

	// res, err := client.Do(req)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return err
	// }
	// defer res.Body.Close()

	// body, err := io.ReadAll(res.Body)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return err
	// }

	// respStruct := infobipentities.VerifyMessageResponse{}

	// err = json.Unmarshal(body, &respStruct)
	// if err != nil {
	// 	return err
	// }

	// fmt.Println("check verification from sms api: ", helpers.ConvertToJSON(respStruct))

	clientParams := twilio.ClientParams{
		Username: s.MainAccount.Username,
		Password: s.MainAccount.Password,
	}

	client := twilio.NewRestClientWithParams(clientParams)

	params := &verify.CreateVerificationCheckParams{}

	params.SetTo(phone)

	params.SetCode(code)

	params.SetVerificationSid(verificationSession)

	resp, err := client.VerifyV2.CreateVerificationCheck(s.MainAccount.ServiceID,
		params)

	if err != nil {

		fmt.Println(err.Error())
		return smserrors.ErrUnableToSendSms

	}
	fmt.Println(helpers.ConvertToJSON(resp))

	if resp.Valid == nil || !*resp.Valid {
		fmt.Println(helpers.ConvertToJSON(resp))
		return smserrors.ErrInvalidVerificationCode

	}

	if resp.Status == nil || *resp.Status != "approved" {
		fmt.Println(helpers.ConvertToJSON(resp))
		return smserrors.ErrUnableToSendSms

	}

	return nil
}
