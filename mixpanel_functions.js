import { Mixpanel } from "mixpanel-react-native";
let mixpanel = null 
export const mixPanelInit = () => {
        // Set up an instance of Mixpanel
    const trackAutomaticEvents = false;
    mixpanel = new Mixpanel("ffd168e05e04966b4228a43fdc9fac01", trackAutomaticEvents);
    console.log("MIXPANEL CONFIGUREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEED---------------------", mixpanel);
    mixpanel.init();
    mixpanel.track('MIXPANEL_INIT', {
       time: (new Date()).getDate()
    });
}

mixPanelInit()

export const callMixpanelPageEvent = (page) => {
        console.log("MIXPANEL PAGE EVENT: ", page)
        if(!mixpanel) {
            console.log("ERRRRRRRRRRRRRRRRROR MIXPANEL NOT CONFIGURED")
        }
        let resp = mixpanel?.track(page + '_EVENT', {
            page
        });
        console.log("mixpanel resp: ", resp)
}