package smsservice

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/alexkalak/qrmenu/src/errors/smserrors"
	"github.com/alexkalak/qrmenu/src/helpers"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/twilio/twilio-go"
	verify "github.com/twilio/twilio-go/rest/verify/v2"
)

// infobipBaseURL is this account's assigned InfoBip subdomain - InfoBip
// hands out a dedicated one per account rather than a shared hostname, and
// it doesn't change, so it isn't worth its own env var. Confirmed live
// (2026-09-05): GET /account/1/balance on this host with the stored
// API_INFO_BIP_AUTH_TOKEN returns 200.
const infobipBaseURL = "https://d9lgz8.api.infobip.com"

type SmsService interface {
	// CreateVerificationSession tries Twilio first and only falls back to
	// InfoBip if Twilio's call itself fails (account suspended, out of
	// quota, network error, ...) - not if Twilio merely reports the number
	// as undeliverable, which InfoBip would fail on too. The returned
	// provider has to be persisted alongside the session (see
	// models.PhoneValidationSession.Provider): CheckVerificationCode needs
	// to know which provider's API actually holds this pin.
	CreateVerificationSession(phone string) (pinID string, provider string, err error)
	CheckVerificationCode(verificationSession, phone, code, provider string) error
}

type twilioAuthData struct {
	Username  string
	Password  string
	ServiceID string
}

type smsService struct {
	MainAccount twilioAuthData

	InfoBipAuthToken     string
	InfoBipApplicationID string
	InfoBipMessageID     string
}

func New() SmsService {
	return &smsService{
		MainAccount: twilioAuthData{
			Username:  "ACf084f5f09f575e36756abfc0f4ffb3e0",
			Password:  "f93b09c6f905d51c2772578fbf820021",
			ServiceID: "VA4642ab28116637fab0c8ea0d2cbab01c",
		},
		// Container-internal names, not the host .env names - docker-compose.yml
		// maps API_INFO_BIP_* (the host/.env side) to these without the API_
		// prefix for the qrmenu-api service's own environment. Confirmed live
		// 2026-09-05: reading the API_-prefixed names here silently produced
		// an empty token, which InfoBip's 2FA endpoint reports as
		// "Invalid login details" (401) - not obviously "empty credential" -
		// while the exact same request with the real token succeeds.
		InfoBipAuthToken:     os.Getenv("INFO_BIP_AUTH_TOKEN"),
		InfoBipApplicationID: os.Getenv("INFO_BIP_APPLICATION_ID"),
		InfoBipMessageID:     os.Getenv("INFO_BIP_MESSAGE_ID"),
	}
}

func (s *smsService) CreateVerificationSession(phone string) (string, string, error) {
	pinID, err := s.createTwilioVerification(phone)
	if err == nil {
		return pinID, models.SMS_PROVIDER_TWILIO, nil
	}
	fmt.Println("smsservice: Twilio verification failed, falling back to InfoBip:", err)

	pinID, infobipErr := s.createInfobipVerification(phone)
	if infobipErr != nil {
		fmt.Println("smsservice: InfoBip verification also failed:", infobipErr)
		// The Twilio error is what a normal outage looks like; InfoBip
		// failing too is the unusual case worth the extra log line above,
		// but the caller only needs one error and Twilio's is the one most
		// often actionable (it's the primary provider).
		return "", "", err
	}

	return pinID, models.SMS_PROVIDER_INFOBIP, nil
}

func (s *smsService) createTwilioVerification(phone string) (string, error) {
	clientParams := twilio.ClientParams{
		Username: s.MainAccount.Username,
		Password: s.MainAccount.Password,
	}
	client := twilio.NewRestClientWithParams(clientParams)

	params := &verify.CreateVerificationParams{}
	params.SetTo(phone)
	params.SetChannel("sms")

	resp, err := client.VerifyV2.CreateVerification(s.MainAccount.ServiceID, params)
	if err != nil {
		fmt.Println(err.Error())
		return "", smserrors.ErrUnableToSendSms
	}
	if resp.Sid == nil {
		fmt.Println(helpers.ConvertToJSON(resp))
		return "", errors.New("no sid in response")
	}

	fmt.Println(helpers.ConvertToJSON(resp))
	return *resp.Sid, nil
}

func (s *smsService) CheckVerificationCode(verificationSession, phone, code, provider string) error {
	if provider == models.SMS_PROVIDER_INFOBIP {
		return s.checkInfobipVerification(verificationSession, code)
	}
	// Empty provider means a session created before this existed, when
	// Twilio was the only option.
	return s.checkTwilioVerification(verificationSession, phone, code)
}

func (s *smsService) checkTwilioVerification(verificationSession, phone, code string) error {
	clientParams := twilio.ClientParams{
		Username: s.MainAccount.Username,
		Password: s.MainAccount.Password,
	}
	client := twilio.NewRestClientWithParams(clientParams)

	params := &verify.CreateVerificationCheckParams{}
	params.SetTo(phone)
	params.SetCode(code)
	params.SetVerificationSid(verificationSession)

	resp, err := client.VerifyV2.CreateVerificationCheck(s.MainAccount.ServiceID, params)
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

type infobipCreatePinResponse struct {
	PinID     string `json:"pinId"`
	To        string `json:"to"`
	SmsStatus string `json:"smsStatus"`
}

func (s *smsService) createInfobipVerification(phone string) (string, error) {
	body, err := json.Marshal(map[string]string{
		"applicationId": s.InfoBipApplicationID,
		"messageId":     s.InfoBipMessageID,
		"to":            phone,
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", infobipBaseURL+"/2fa/2/pin", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "App "+s.InfoBipAuthToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", smserrors.ErrUnableToSendSms
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		fmt.Println("smsservice: InfoBip create pin failed with status", resp.StatusCode, string(respBody))
		return "", smserrors.ErrUnableToSendSms
	}

	var parsed infobipCreatePinResponse
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return "", err
	}
	if parsed.PinID == "" {
		return "", errors.New("no pinId in InfoBip response")
	}

	fmt.Println("smsservice: InfoBip pin created:", string(respBody))
	return parsed.PinID, nil
}

type infobipVerifyPinResponse struct {
	PinID             string `json:"pinId"`
	Msisdn            string `json:"msisdn"`
	Verified          bool   `json:"verified"`
	AttemptsRemaining int    `json:"attemptsRemaining"`
}

func (s *smsService) checkInfobipVerification(pinID, code string) error {
	body, err := json.Marshal(map[string]string{"pin": code})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", infobipBaseURL+"/2fa/2/pin/"+pinID+"/verify", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "App "+s.InfoBipAuthToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return smserrors.ErrUnableToSendSms
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		fmt.Println("smsservice: InfoBip verify pin failed with status", resp.StatusCode, string(respBody))
		return smserrors.ErrUnableToSendSms
	}

	var parsed infobipVerifyPinResponse
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return err
	}

	fmt.Println("smsservice: InfoBip verify response:", string(respBody))
	if !parsed.Verified {
		return smserrors.ErrInvalidVerificationCode
	}

	return nil
}
