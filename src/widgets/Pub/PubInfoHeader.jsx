import { Spinner, Text, View } from "native-base";
import { useGetNearbyPubsQuery, useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { AnonymousProBold } from "../../constants/styles-constants";
import { pubStyles } from "./pubs.styles";

const PubInfoHeader = ({ pubID }) => {
  const location = useSelector(selectGeolocation);

  // Is used to quickly show info for pub, while full pub info is loading
  const { data: nearPubsData, error: nearPubsError } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location }
  );

  useEffect(() => {
    console.log("near pubs data: ", nearPubsData);
  }, [nearPubsData]);

  useEffect(() => {
    console.log("near pubs error: ", nearPubsError);
  }, [nearPubsError]);

  const {data: pubData, error: pubError, pubIsLoading} = useGetPubInfoQuery({ pubID }, { skip: !pubID });

  useEffect(() => {
    console.log("pubData in pub info header: ", pubData);
  }
  , [pubData])

  useEffect(() => {
    console.log("pubError in pub info header: ", pubError);
  }
  , [pubError])


  const pub = pubData?.pub ?? nearPubsData?.pubs?.find((pub) => pub.id === pubID);

  return (
    <View>
      {!pub && <Spinner color={"black"} size={40} />}
      {pub && (
        <View px="10" pb="10">
          {/* NAME */}
          <Text
            fontFamily={AnonymousProBold}
            color={"#dc4444"}
            fontSize={32}
            textAlign={"center"}
            mb={5}
          >
            {pub.name}
          </Text>

          <View gap={2}>
          
            {/* ADDRESS */}
            {pub.address && (
              <Text>
                <Text style={pubStyles.pubHeaderInfoRowName}>Address:</Text>
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
                  Additional info:
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
