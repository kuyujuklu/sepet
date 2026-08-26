import { Spinner, Text, View } from "native-base";
import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import NoPubsPage from "./NoPubsPage";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import TopDishesList from "../../widgets/TopDishes/TopDishesList";
import BasketFloatingBar from "../../widgets/Basket/BasketFloatingBar";
import CityPicker from "../../widgets/Geolocation/CityPicker";
import { useNearbyCategoryNames } from "../../shared/hooks/useNearbyCategoryNames";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import {
  selectGeolocation,
  selectHasGeolocationPerm,
} from "../../features/store/geolocation/geolocationSlice";
import { selectSection } from "../../features/store/sections/sectionSlice";
import { filterCategoryNamesBySection } from "../../shared/utils/sections";
import { SCREEN_PADDING } from "../../constants/layout";
import { Screens } from "../../app/navigation/screens";

const Home = () => {
  const { t } = useTranslation();

  const location = useSelector(selectGeolocation);
  const hasGeolocationPerm = useSelector(selectHasGeolocationPerm);
  const section = useSelector(selectSection);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [askForCity, setAskForCity] = useState(false);

  // A category of the previous section means nothing in the new one
  useEffect(() => {
    setSelectedCategory("");
  }, [section]);

  const { possibleCategoryNames } = useNearbyCategoryNames();

  const sectionCategoryNames = useMemo(
    () => filterCategoryNamesBySection(possibleCategoryNames, section),
    [possibleCategoryNames, section],
  );

  const { data: nearPubsData } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng } },
    { skip: !location, pollingInterval: 20000, skipPollingIfUnfocused: true },
  );

  const hasNoPubs = nearPubsData && nearPubsData?.pubs?.length === 0;

  // No address is required to get here any more, so the screen has to cope
  // with "we do not know where the client is" on its own: either the device
  // refused us the position, or it is still being resolved.
  const isWaitingForLocation = !location;
  const shouldAskForCity = askForCity || hasGeolocationPerm === false;

  const renderBody = () => {
    if (isWaitingForLocation && shouldAskForCity) return <CityPicker />;

    if (isWaitingForLocation) {
      return (
        <View flex={1} alignItems="center" justifyContent="center" gap={4} px="8">
          <Spinner color="emerald.600" size="lg" />
          <Text textAlign="center" color="coolGray.500" fontSize={15}>
            {t("city_picker.detecting")}
          </Text>

          <TouchableOpacity activeOpacity={0.7} onPress={() => setAskForCity(true)}>
            <Text color="emerald.600" fontSize={14} underline>
              {t("city_picker.select_manually")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasNoPubs) {
      return (
        <View flex={1}>
          <NoPubsPage />
        </View>
      );
    }

    return (
      <>
        <View flex={1}>
          <TopDishesList
            sectionId={section}
            possibleCategoryNames={sectionCategoryNames}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* The Wrapper already reserves the gesture area, so this only needs
            the gap between the bar and the bottom of the content */}
        <View
          position="absolute"
          w="full"
          style={{ paddingHorizontal: SCREEN_PADDING, bottom: 12 }}
        >
          <BasketFloatingBar />
        </View>
      </>
    );
  };

  return (
    <Wrapper>
      <AppHeader
        showBack
        // Home is the root of the stack after the picker, so a plain
        // `goBack` is not guaranteed to exist (deep links land here directly)
        fallbackScreen={Screens.SectionPicker}
        showSections
        screen="Home"
        onSectionChange={() => setSelectedCategory("")}
      />

      {renderBody()}
    </Wrapper>
  );
};

export default Home;
