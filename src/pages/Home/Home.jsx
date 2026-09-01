import { Spinner, Text, View } from "native-base";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import NoPubsPage from "./NoPubsPage";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import TopDishesList from "../../widgets/TopDishes/TopDishesList";
import BasketFloatingBar from "../../widgets/Basket/BasketFloatingBar";
import ActiveOrdersFloatingBar from "../../widgets/Orders/ActiveOrdersFloatingBar";
import CityPicker from "../../widgets/Geolocation/CityPicker";
import { useNearbyCategoryNames } from "../../shared/hooks/useNearbyCategoryNames";
import { useGetNearbyPubsQuery } from "../../shared/api/pubs/pubsApi";
import {
  selectGeolocation,
  selectHasGeolocationPerm,
} from "../../features/store/geolocation/geolocationSlice";
import { selectSection } from "../../features/store/sections/sectionSlice";
import { selectBasket } from "../../features/store/basket/basketSlice";
import { getBasketCount } from "../../shared/utils/basket";
import { useSafeBottomInset } from "../../shared/hooks/useSafeBottomInset";
import { SCREEN_PADDING } from "../../constants/layout";
import { Screens } from "../../app/navigation/screens";

const Home = () => {
  const { t } = useTranslation();

  const location = useSelector(selectGeolocation);
  const hasGeolocationPerm = useSelector(selectHasGeolocationPerm);
  const section = useSelector(selectSection);
  const basket = useSelector(selectBasket);

  const hasBasketItems = getBasketCount(basket) > 0;
  const floatingBarBottom = useSafeBottomInset(12);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [askForCity, setAskForCity] = useState(false);

  // A category of the previous section means nothing in the new one
  useEffect(() => {
    setSelectedCategory("");
  }, [section]);

  // Section-scoped server-side: `?section=` on get-available-categories
  // returns only the categories of this section, so there is no client-side
  // include/exclude rule left to run over the slugs
  const { possibleCategoryNames } = useNearbyCategoryNames(section);

  const { data: nearPubsData } = useGetNearbyPubsQuery(
    { coords: { lat: location?.lat, lng: location?.lng }, section },
    { skip: !location },
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
            possibleCategoryNames={possibleCategoryNames}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* Explicit inset here rather than trusting the Wrapper's own
            padding to reach an absolutely positioned child - see
            floatingBarBottom above */}
        <View
          position="absolute"
          w="full"
          style={{ paddingHorizontal: SCREEN_PADDING, bottom: floatingBarBottom }}
        >
          {hasBasketItems ? <BasketFloatingBar /> : <ActiveOrdersFloatingBar />}
        </View>
      </>
    );
  };

  return (
    <Wrapper>
      <AppHeader
        showBack
        // Home is the root of the stack after the picker, so a plain
        // `goBack` is not guaranteed to exist (deep links land here directly).
        // That back arrow is also the only way to change section now - the
        // switcher used to sit here, but the client already chose on the
        // picker screen it leads back to.
        fallbackScreen={Screens.SectionPicker}
      />

      {renderBody()}
    </Wrapper>
  );
};

export default Home;
