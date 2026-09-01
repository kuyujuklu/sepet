import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import BasketItemRow from "../../widgets/Basket/BasketItemRow";
import BasketSummary from "../../widgets/Basket/BasketSummary";
import BasketCreateOrderButton from "../../widgets/Basket/BasketCreateOrderButton";
import BasketGoToRegistrationButton from "../../widgets/Basket/BasketGoToRegistrationButton";
import { RowsSkeleton } from "../../widgets/Skeletons/Skeleton";
import { usePubInfo } from "../../shared/hooks/usePubInfo";
import { useOrderPreview } from "../../shared/hooks/useOrderPreview";
import {
  openClearBasketPopup,
  selectBasket,
  selectBasketPubID,
} from "../../features/store/basket/basketSlice";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";
import { selectClient } from "../../features/store/auth/authSlice";
import {
  getBasketCount,
  getBasketItemsPrice,
  getDeliveryPrice,
  getMinOrderPrice,
} from "../../shared/utils/basket";
import { formatPrice, getCurrencySymbol } from "../../shared/utils/dish";
import { images } from "../../app/images/images";
import { useSafeBottomInset } from "../../shared/hooks/useSafeBottomInset";
import { SCREEN_PADDING } from "../../constants/layout";

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_PADDING, paddingBottom: 190, gap: 10 },
  pubCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  pubName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  pubMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  pubLink: { fontSize: 13, color: "#059669", fontWeight: "bold" },
  addMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#059669",
    borderStyle: "dashed",
    paddingVertical: 14,
    marginTop: 6,
  },
  addMoreText: { color: "#047857", fontSize: 15, fontWeight: "bold" },
  warning: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 14,
  },
  warningText: { fontSize: 13, color: "#9a3412", lineHeight: 18 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyIcon: { width: 64, height: 64, opacity: 0.35 },
  emptyTitle: { fontSize: 19, fontWeight: "bold", color: "#111" },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  emptyButton: {
    backgroundColor: "#059669",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  clear: { fontSize: 13, color: "#dc2626", fontWeight: "bold" },
  // Two layers on purpose. The outer one reaches the true bottom edge and
  // carries the safe-area clearance as plain padding - same background, no
  // border, so it reads as ordinary bottom padding rather than part of the
  // button's own backdrop (that reading is what made the button look like it
  // was floating high inside an oversized box). The inner one is the actual
  // visible card: a snug, fixed padding around the button and the border
  // that frames it, unaffected by how tall the safe area happens to be.
  bottomBarSafeArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f5f5f5",
  },
  bottomBar: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8e8ea",
    gap: 8,
  },
});

const BasketPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const bottomBarInset = useSafeBottomInset();

  const basket = useSelector(selectBasket);
  const pubID = useSelector(selectBasketPubID);
  const location = useSelector(selectGeolocation);
  const client = useSelector(selectClient);

  // Asked for with the current coordinates, so the response already carries
  // shipping_price / shipping_free_delivery_price / shipping_min_order_price
  // and there is nothing left to merge from the nearby-pubs list
  const { data: pubData, isLoading: isPubLoading } = usePubInfo({ pubID });

  const pub = pubData?.pub;
  const currency = getCurrencySymbol(pub?.currency_id);

  const isAvailableForDelivery = pub?.isAvailableForDelivery !== false;
  const isPubOpen = pub?.isOpen !== false;

  const items = useMemo(() => {
    if (!pubData?.dishes) return [];

    return pubData.dishes
      .filter((dish) => +basket?.[dish.id]?.count > 0)
      .map((dish) => ({ dish, item: basket[dish.id] }));
  }, [pubData, basket]);

  const count = getBasketCount(basket);

  // The server prices the basket; the local sum is what the screen shows
  // while that is in flight and when it failed (offline)
  const { preview, unavailableDishIDs, canBeOrdered } = useOrderPreview({
    pubID,
    basket,
    coords: location,
    enabled: count > 0 && !!pubID,
  });

  const localItemsPrice = getBasketItemsPrice(basket, pub);
  const itemsPrice = preview ? +preview.items_price : localItemsPrice;
  const deliveryPrice = preview
    ? +preview.delivery_price
    : getDeliveryPrice(pub, itemsPrice);

  const freeDeliveryFrom = preview
    ? +preview.free_delivery_price || 0
    : +pub?.shipping_free_delivery_price || 0;
  const leftForFreeDelivery =
    freeDeliveryFrom > 0 && itemsPrice < freeDeliveryFrom
      ? freeDeliveryFrom - itemsPrice
      : null;

  // "Минимальный заказ 150 lei" - a hard rule since the server started
  // refusing anything under it with a 400
  const minOrderPrice = preview
    ? +preview.min_order_price || 0
    : getMinOrderPrice(pub);
  const leftForMinOrder =
    minOrderPrice > 0 && itemsPrice < minOrderPrice
      ? minOrderPrice - itemsPrice
      : null;

  const hasUnavailableDishes = unavailableDishIDs.length > 0;

  const isEmpty = count === 0;
  // The dishes are only known once pub-info arrives, so an empty list while
  // the basket is not empty means "still loading", not "nothing here"
  const isLoading = !isEmpty && (isPubLoading || items.length === 0);

  const goToPub = () => navigator.navigate("PubInfo", { pubID });

  const clearBasket = () =>
    dispatch(
      openClearBasketPopup({
        text: "basket_page.clear_confirm",
        okButtonText: "basket_page.clear_ok",
        cancelButtonText: "basket_popup.cancel_button",
      }),
    );

  const header = (
    <>
      {!!pub && (
        <View style={styles.pubCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pubName} numberOfLines={1}>
              {pub.name}
            </Text>
            <Text style={styles.pubMeta} numberOfLines={1}>
              {t("basket_page.positions", { value: count })}
              {pub?.shipping?.shipping_time_from
                ? ` · ${pub.shipping.shipping_time_from}-${pub.shipping.shipping_time_to} ${t("basket_page.minutes")}`
                : ""}
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={goToPub}>
            <Text style={styles.pubLink}>{t("basket_page.open_pub")} →</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const footer = (
    <View style={{ gap: 10 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.addMore}
        onPress={goToPub}
      >
        <Text style={styles.addMoreText}>+ {t("basket_page.add_more")}</Text>
      </TouchableOpacity>

      {!isPubOpen && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            {t("basket_page.pub_is_closed_error")}
          </Text>
        </View>
      )}

      {!isAvailableForDelivery && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            {t("basket_page.not_available_for_delivery")}
          </Text>
        </View>
      )}

      {hasUnavailableDishes && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            {t("basket_page.unavailable_dishes")}
          </Text>
        </View>
      )}

      {leftForMinOrder > 0 && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            {t("basket_page.min_order_left", {
              amount: `${formatPrice(leftForMinOrder)} ${currency}`,
              min: `${formatPrice(minOrderPrice)} ${currency}`,
            })}
          </Text>
        </View>
      )}

      <BasketSummary
        itemsPrice={itemsPrice}
        deliveryPrice={deliveryPrice}
        currency={currency}
        leftForFreeDelivery={leftForFreeDelivery}
        freeDeliveryFrom={freeDeliveryFrom}
      />
    </View>
  );

  return (
    <Wrapper>
      <AppHeader
        showBack
        showAddress={false}
        title={t("basket_page.headline")}
        right={
          isEmpty ? null : (
            <TouchableOpacity activeOpacity={0.7} onPress={clearBasket}>
              <Text style={styles.clear}>{t("basket_page.clear")}</Text>
            </TouchableOpacity>
          )
        }
      />

      {isEmpty ? (
        <View style={styles.empty}>
          <Image
            source={images.Cart}
            style={styles.emptyIcon}
            contentFit="contain"
            alt=""
          />
          <Text style={styles.emptyTitle}>{t("basket_page.empty_title")}</Text>
          <Text style={styles.emptyText}>{t("basket_page.empty_text")}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emptyButton}
            onPress={() => navigator.navigate("Home")}
          >
            <Text style={styles.emptyButtonText}>
              {t("basket_page.empty_button")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ paddingTop: 8 }}>
          <RowsSkeleton count={3} thumbSize={74} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(entry) => String(entry.dish.id)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          renderItem={({ item: entry }) => (
            <BasketItemRow
              dish={entry.dish}
              item={entry.item}
              pub={pub}
              pubID={pubID}
            />
          )}
        />
      )}

      {!isEmpty && (
        <View style={[styles.bottomBarSafeArea, { paddingBottom: bottomBarInset }]}>
          <View style={styles.bottomBar}>
            {!client || client.isGuest ? (
              <BasketGoToRegistrationButton />
            ) : (
              <BasketCreateOrderButton
                itemsPrice={itemsPrice}
                deliveryPrice={deliveryPrice}
                currency={currency}
                isAvailableForDelivery={isAvailableForDelivery}
                isPubOpen={isPubOpen}
                canBeOrdered={canBeOrdered}
                hasUnavailableDishes={hasUnavailableDishes}
                leftForMinOrder={leftForMinOrder}
                minOrderPrice={minOrderPrice}
              />
            )}
          </View>
        </View>
      )}
    </Wrapper>
  );
};

export default BasketPage;
