import { Image } from "expo-image";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { images } from "../../app/images/images";
import { GetShippingTimeString } from "../../shared/utils/time";
import BottomSheet from "../Common/BottomSheet";

const styles = StyleSheet.create({
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: { fontSize: 15, fontWeight: "bold", color: "#111" },
  star: { width: 15, height: 15 },
  status: { fontSize: 14, marginTop: 10, fontWeight: "bold" },
  open: { color: "#059669" },
  closed: { color: "#dc2626" },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  icon: { width: 18, height: 18, opacity: 0.55, marginTop: 1 },
  label: { fontSize: 12, color: "#9ca3af" },
  value: { fontSize: 15, color: "#111", lineHeight: 20 },
  link: { color: "#059669", fontWeight: "bold" },
  info: { fontSize: 14, color: "#52525b", lineHeight: 20, marginTop: 16 },
});


const Row = ({ icon, label, children }) => (
  <View style={styles.row}>
    <Image source={icon} style={styles.icon} contentFit="contain" alt="" />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  </View>
);

// Everything about the place, on demand. It used to be a block of text pinned
// above every list inside the pub, eating the first screen of the menu.
const PubInfoPopup = ({ pub, isOpened, onClose }) => {
  const { t } = useTranslation();

  const rating = +pub?.rating;
  const hasRating = !isNaN(rating) && rating > 0;

  const workHours = GetShippingTimeString({
    start: pub?.shipping?.shipping_work_start,
    end: pub?.shipping?.shipping_work_end,
  });

  return (
    <BottomSheet
      id="pubInfo"
      isOpened={isOpened}
      onClose={onClose}
      title={pub?.name}
      scrollable
    >
      {hasRating && (
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Image
            source={images.StarFilled}
            style={styles.star}
            contentFit="contain"
            alt=""
          />
        </View>
      )}

      <Text style={[styles.status, pub?.isOpen ? styles.open : styles.closed]}>
        {pub?.isOpen ? t("pub_info_page.is_open") : t("home_page.pub_is_closed")}
        {workHours ? ` \u00b7 ${workHours}` : ""}
      </Text>

      {!!pub?.address && (
        <Row icon={images.Locaiton} label={t("pub_info_page.pub_header.address")}>
          <Text style={styles.value}>{pub.address}</Text>
        </Row>
      )}

      {!!pub?.phone && (
        <Row icon={images.TechSupport} label={t("pub_info_page.phone")}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`tel:${pub.phone}`)}
          >
            <Text style={[styles.value, styles.link]}>{pub.phone}</Text>
          </TouchableOpacity>
        </Row>
      )}

      {!!pub?.shipping?.shipping_time_from && (
        <Row
          icon={images.ClockBlack}
          label={t("create_order_page.additional_data.delivery_time")}
        >
          <Text style={styles.value}>
            {[pub.shipping.shipping_time_from, pub.shipping.shipping_time_to]
              .filter(Boolean)
              .join("\u2013")}{" "}
            {t("basket_page.minutes")}
          </Text>
        </Row>
      )}

      {!!pub?.additional_info && (
        <Text style={styles.info}>{pub.additional_info}</Text>
      )}
    </BottomSheet>
  );
};

export default PubInfoPopup;
