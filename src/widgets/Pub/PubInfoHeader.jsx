import { Spinner, Text, View } from "native-base";
import {
  useGetNearbyPubsQuery,
  useGetPubInfoQuery,
} from "../../shared/api/pubs/pubsApi";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { AnonymousProBold } from "../../constants/styles-constants";
import { pubStyles } from "./pubs.styles";
import { useTranslation } from "react-i18next";

const PubInfoHeader = ({ pubID }) => {
  const { t } = useTranslation();
  const location = useSelector(selectGeolocation);

  // Is used to quickly show info for pub, while full pub info is loading
  const { data: nearPubsData, error: nearPubsError } = useGetNearbyPubsQuery(
    {
      coords: { lat: location?.lat, lng: location?.lng },
    },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  useEffect(() => {}, [nearPubsData]);

  useEffect(() => {}, [nearPubsError]);

  const {
    data: pubData,
    error: pubError,
    pubIsLoading,
  } = useGetPubInfoQuery({ pubID }, { skip: !pubID });

  useEffect(() => {}, [pubData]);

  useEffect(() => {}, [pubError]);

  const pub =
    pubData?.pub ?? nearPubsData?.pubs?.find((pub) => pub.id === pubID);

  return (
    <View>
      {!pub && <Spinner color={"black"} size={40} />}
      {pub && (
        <View px="10" pb="5">
          {/* NAME */}
          <Text
            fontFamily={AnonymousProBold}
            color={"#dc4444"}
            fontSize={32}
            textAlign={"center"}
          >
            {pub.name}
          </Text>

          <View gap={2}>
            {/* ADDRESS */}
            {pub.address && (
              <Text>
                <Text style={pubStyles.pubHeaderInfoRowName}>
                  {t("pub_info_page.pub_header.address")}:
                </Text>
                <Text style={pubStyles.pubHeaderInfoRowText}>
                  {pub.address}
                </Text>
              </Text>
            )}

            {/* PHONE */}
            {pub.phone && (
              <Text>
                <Text style={pubStyles.pubHeaderInfoRowName}>Phone:</Text>
                <Text style={pubStyles.pubHeaderInfoRowText}>{pub.phone} </Text>
              </Text>
            )}

            {/* ADDITIONAL INFO */}
            {pub.additional_info && (
              <Text>
                <Text style={pubStyles.pubHeaderInfoRowName}>
                  {t("pub_info_page.pub_header.additional_info")}:
                </Text>
                <Text style={pubStyles.pubHeaderInfoRowText}>
                  {pub.additional_info}
                </Text>
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default PubInfoHeader;
