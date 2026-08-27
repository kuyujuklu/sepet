import { useMemo } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import DishRow from "../Dish/DishRow";
import { RowsSkeleton } from "../Skeletons/Skeleton";
import { usePubInfo } from "../../shared/hooks/usePubInfo";
import { SCREEN_PADDING } from "../../constants/layout";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 150,
  },
  header: {
    backgroundColor: "#f5f5f5",
    paddingTop: 16,
    paddingBottom: 10,
  },
  menuName: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#111" },
  headerCount: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  separator: { height: 10 },
  empty: { paddingHorizontal: 32, paddingVertical: 40 },
  emptyText: { textAlign: "center", color: "#6b7280", fontSize: 15 },
});

// The whole menu on one screen: a category heading and its dishes right below
// it. Every menu of the pub is included - the bottom menu tabs are gone, so
// this list is the only place the second menu can appear; the menu name is
// printed above its first category when there is more than one.
const FullMenuList = ({ pubID, menus, isPubOpen, isAvailableForDelivery }) => {
  const { t } = useTranslation();

  const { data: pubData, isLoading } = usePubInfo({ pubID });

  const sections = useMemo(() => {
    if (!pubData?.categories || !pubData?.dishes) return [];

    const visibleMenus = (menus ?? pubData?.menus ?? [])
      .filter((menu) => menu?.visible)
      .sort((a, b) => (a?.place ?? 0) - (b?.place ?? 0));

    const menuNameById = {};
    visibleMenus.forEach((menu) => {
      menuNameById[menu.id] = menu.name;
    });

    const menuOrder = visibleMenus.map((menu) => menu.id);
    const showMenuNames = visibleMenus.length > 1;

    const built = pubData.categories
      .filter((category) => category?.visible)
      // A category of a hidden menu must not leak into the list
      .filter((category) => !menuOrder.length || menuOrder.includes(category.menu_id))
      .map((category) => ({
        category,
        title: category?.name,
        menuId: category?.menu_id,
        data: pubData.dishes.filter(
          (dish) => dish?.category_id === category.id && dish?.visible,
        ),
      }))
      // A heading with nothing under it is just noise
      .filter((section) => section.data.length > 0);

    built.sort(
      (a, b) => menuOrder.indexOf(a.menuId) - menuOrder.indexOf(b.menuId),
    );

    let previousMenuId = null;

    return built.map((section) => {
      const isFirstOfMenu = showMenuNames && section.menuId !== previousMenuId;
      previousMenuId = section.menuId;

      return {
        ...section,
        menuName: isFirstOfMenu ? menuNameById[section.menuId] : null,
      };
    });
  }, [pubData, menus]);

  if (isLoading || !pubData) {
    return (
      <View style={{ paddingTop: 12 }}>
        <RowsSkeleton count={5} thumbSize={76} />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(dish) => String(dish.id)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={9}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("pub_info_page.empty_menu")}</Text>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.header}>
          {!!section.menuName && (
            <Text style={styles.menuName}>{section.menuName}</Text>
          )}
          <Text style={styles.headerText}>{section.title}</Text>
          <Text style={styles.headerCount}>
            {t("pub_info_page.dishes_count", { value: section.data.length })}
          </Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item: dish }) => (
        <DishRow
          dish={dish}
          pub={pubData?.pub}
          pubID={pubID}
          isPubOpen={isPubOpen}
          isAvailableForDelivery={isAvailableForDelivery}
        />
      )}
    />
  );
};

export default FullMenuList;
