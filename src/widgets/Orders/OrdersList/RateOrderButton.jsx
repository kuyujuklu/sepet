import { Image } from "expo-image";
import { Spinner, Text, View } from "native-base";
import { images } from "../../../app/images/images";
import { useRateOrderMutation } from "../../../shared/api/ordersApi/ordersApi";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Stars from "../../Pub/Stars";
import Star from "./Star";

const RateOrderButton = ({ orderID, rating }) => {
  const { t } = useTranslation();
  const [
    rateOrderRequest,
    {
      data: rateOrderData,
      error: rateOrderError,
      isLoading: isRateOrderLoading,
    },
  ] = useRateOrderMutation();

  const [isRatingShown, setIsRatingShown] = useState(false);

  useEffect(() => {
    setIsRatingShown(!!rating);
  }, [rating]);

  const handleRateClick = () => {
    if (!rating || rating === 0) {
      setIsRatingShown(true);
    }
  };

  const handleStarClick = (rating) => {
    rateOrderRequest({ orderID, rating });
  };

  useEffect(() => {
    if (!rateOrderData) return;
    console.log(rateOrderData);
  }, [rateOrderData]);
  useEffect(() => {
    if (!rateOrderError) return;
    console.log(rateOrderError);
  }, [rateOrderError]);

  const MAX_RATING = 5;
  return (
    <>
      {!isRatingShown && (
        <TouchableOpacity onPress={handleRateClick}>
          <View flexDir="row" alignItems="center" gap={2}>
            <View width={15} height={15}>
              <Image
                source={images.LikeDislikeBlack}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text fontSize="12">{t("order_page.order_card.rate_button")}</Text>
          </View>
        </TouchableOpacity>
      )}
      {isRatingShown && (
        <View>
          {!isRateOrderLoading && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* Empty start */}
              {Array.from({ length: MAX_RATING }).map((_, i) => (
                <Pressable onPress={() => handleStarClick(i + 1)}>
                  <Star empty={i >= (rating ?? 0)} />
                </Pressable>
              ))}
            </View>
          )}

          {isRateOrderLoading && <View flexDir="row" justifyContent="flex-start">
              <Spinner />
            </View>}
        </View>
      )}
    </>
  );
};

export default RateOrderButton;
