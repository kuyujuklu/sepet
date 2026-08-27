import { useEffect } from "react";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import SectionCard from "../../widgets/Sections/SectionCard";
import SwitchLanguage from "../../widgets/Profile/SwitchLanguage";
import { images } from "../../app/images/images";
import { SCREEN_PADDING } from "../../constants/layout";
import { sectionsList, defaultSectionId } from "../../shared/utils/sections";
import { useGetServiceTypesQuery } from "../../shared/api/dictionaries/dictionariesApi";
import { setSection } from "../../features/store/sections/sectionSlice";
import {
  alertStatuses,
  pushAlert,
} from "../../features/store/alerts/alertSlice";
import { events, track } from "../../shared/analytics/analytics";
import { useLinkedDestination } from "../../shared/hooks/useLinkedDestination";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 32,
    gap: 14,
  },
  // The language sits above everything else: a client who cannot read the
  // headline has to be able to fix that before answering the question
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginTop: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 19,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
});

// The first screen of the app. It asks one question only - what the client
// came for - and does NOT ask for an address: the location is guessed in the
// background (GeolocationFinder / CityPicker) and the exact one is collected
// at checkout.
const SectionPickerPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { linkedDestination, goToLinkedDestination } = useLinkedDestination();

  // Which sections the server actually serves. It used to be an `available`
  // flag hand-edited in sections.js and flipped by a release; groceries in
  // particular waited for one. Until the answer arrives every section is
  // treated as available - the picker must not be a dead screen offline.
  const { data: serviceTypesData } = useGetServiceTypesQuery();
  const availableSections = serviceTypesData?.service_types ?? null;

  const isSectionAvailable = (sectionId) =>
    !availableSections || availableSections.includes(sectionId);

  // A deep link knows where it is going; do not stop it with a question
  useEffect(() => {
    if (!linkedDestination) return;

    dispatch(setSection(defaultSectionId));
    goToLinkedDestination();
  }, [linkedDestination]);

  const selectSection = (section) => {
    if (!isSectionAvailable(section?.id)) {
      track(events.sectionUnavailable, { section: section?.id });
      dispatch(
        pushAlert({
          status: alertStatuses.info,
          delay: 2500,
          title: t("sections.coming_soon_alert"),
        }),
      );
      return;
    }

    track(events.sectionSelected, { section: section.id, source: "picker" });
    dispatch(setSection(section.id));
    goToLinkedDestination();
  };

  return (
    <Wrapper>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.languageRow}>
          <SwitchLanguage fullWidth={false} compact onCard />
        </View>

        <Image
          source={images.Sepet}
          contentFit="contain"
          style={styles.logo}
          alt=""
        />

        <Text style={styles.headline}>{t("sections.headline")}</Text>
        <Text style={styles.subheadline}>{t("sections.subheadline")}</Text>

        {sectionsList.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isAvailable={isSectionAvailable(section.id)}
            onPress={selectSection}
          />
        ))}
      </ScrollView>
    </Wrapper>
  );
};

export default SectionPickerPage;
