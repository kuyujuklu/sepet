import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ENV } from "../../constants/env/env";
import { images } from "../../app/images/images";
import { GetShippingTimeString } from "../../shared/utils/time";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  imageBox: {
    height: 132,
    backgroundColor: "#e4e4e7",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { width: 44, height: 44, opacity: 0.35 },
  closedVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  closedText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  closedHours: { color: "#e4e4e7", fontSize: 13 },
  rating: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  star: { width: 12, height: 12 },
  freeDelivery: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  freeDeliveryText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  body: { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  name: { fontSize: 17, fontWeight: "bold", color: "#111" },
  meta: { flexDirection: "row", alignItems: "center", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaIcon: { width: 14, height: 14, opacity: 0.6 },
  metaText: { fontSize: 13, color: "#52525b" },
});

// One establishment in a list. Replaces the old category-card-with-pub-info:
// the client is choosing a place here, so the place is what the card is about.
const PubCard = ({ pub, onPress }) => {
  const { t } = useTranslation();

  const imagePath = pub?.bg_image_file_name
    ? ENV.API_HTTP_URL +
      ENV.API_STATIC_PATH +
      "/images/pubs/bgs/" +
      pub.bg_image_file_name
    : null;

  const rating = +pub?.rating;
  const hasRating = !isNaN(rating) && rating > 0;

  const hasFreeDelivery =
    !isNaN(+pub?.shipping_free_delivery_price) &&
    +pub?.shipping_free_delivery_price > 0;

  const timeFrom = pub?.shipping?.shipping_time_from;
  const timeTo = pub?.shipping?.shipping_time_to;

  const distanceInKm = +pub?.distance / 1000;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.imageBox}>
          {imagePath ? (
            <Image
              source={{ uri: imagePath }}
              style={styles.image}
              contentFit="cover"
              recyclingKey={String(pub?.id)}
              cachePolicy="memory-disk"
              transition={120}
              alt=""
            />
          ) : (
            <Image
              source={images.KnifeInPlateBlack}
              style={styles.placeholder}
              contentFit="contain"
              alt=""
            />
          )}

          {hasRating && (
            <View style={styles.rating}>
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              <Image
                source={images.StarFilled}
                style={styles.star}
                contentFit="contain"
                alt=""
              />
            </View>
          )}

          {hasFreeDelivery && pub?.isOpen && (
            <View style={styles.freeDelivery}>
              <Text style={styles.freeDeliveryText}>
                {t("pub_card.free_delivery_from")}{" "}
                {pub.shipping_free_delivery_price} Lei
              </Text>
            </View>
          )}

          {!pub?.isOpen && (
            <View style={styles.closedVeil}>
              <Text style={styles.closedText}>
                {t("home_page.pub_is_closed")}
              </Text>
              <Text style={styles.closedHours}>
                {GetShippingTimeString({
                  start: pub?.shipping?.shipping_work_start,
                  end: pub?.shipping?.shipping_work_end,
                })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {pub?.name}
          </Text>

          <View style={styles.meta}>
            {!!(timeFrom || timeTo) && (
              <View style={styles.metaItem}>
                <Image
                  source={images.ClockBlack}
                  style={styles.metaIcon}
                  contentFit="contain"
                  alt=""
                />
                <Text style={styles.metaText}>
                  {[timeFrom, timeTo].filter(Boolean).join("–")}{" "}
                  {t("basket_page.minutes")}
                </Text>
              </View>
            )}

            {!isNaN(+pub?.shipping_price) && (
              <View style={styles.metaItem}>
                <Image
                  source={images.WheelBlack}
                  style={styles.metaIcon}
                  contentFit="contain"
                  alt=""
                />
                <Text style={styles.metaText}>
                  {Math.floor(+pub.shipping_price)} Lei
                </Text>
              </View>
            )}

            {!isNaN(distanceInKm) && (
              <View style={styles.metaItem}>
                <Image
                  source={images.Locaiton}
                  style={styles.metaIcon}
                  contentFit="contain"
                  alt=""
                />
                <Text style={styles.metaText}>
                  {distanceInKm.toFixed(1)} km
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(PubCard);
