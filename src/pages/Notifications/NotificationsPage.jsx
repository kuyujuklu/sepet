import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Wrapper from "../Wrapper";
import AppHeader from "../../widgets/AppHeader/AppHeader";
import {
  selectNotificationsHistory,
  selectUnreadNotificationsCount,
} from "../../features/store/notifications/notificationsHistorySlice";
import {
  clearNotificationsHistory,
  markNotificationsHistoryRead,
} from "../../shared/utils/pushNotificationsHistory";
import { ConvertApiTimeToLocal } from "../../shared/utils/time";
import { SCREEN_PADDING } from "../../constants/layout";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 10,
  },
  clearRow: { alignItems: "flex-end" },
  clearText: {
    fontSize: 13,
    color: "#6b7280",
    textDecorationLine: "underline",
  },
  card: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: "#059669",
  },
  dotRead: { backgroundColor: "transparent" },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: "bold", color: "#111" },
  text: { fontSize: 14, color: "#3f3f46", lineHeight: 19 },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24, gap: 8 },
  emptyText: { fontSize: 15, color: "#6b7280", textAlign: "center" },
});

// Профиль → Дополнительные настройки → Уведомления: every push the client
// received, kept locally (see shared/utils/pushNotificationsHistory.js) since
// the backend has no notification inbox of its own to fetch this from.
const NotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const history = useSelector(selectNotificationsHistory);
  const unreadCount = useSelector(selectUnreadNotificationsCount);

  // Opening the screen is how the client "sees" their notifications
  useEffect(() => {
    if (unreadCount > 0) markNotificationsHistoryRead(dispatch);
  }, [unreadCount > 0]);

  return (
    <Wrapper>
      <AppHeader title={t("notifications_page.title")} showAddress={false} showBack right={null} />

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t("notifications_page.empty")}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.clearRow}
              onPress={() => clearNotificationsHistory(dispatch)}
            >
              <Text style={styles.clearText}>{t("notifications_page.clear")}</Text>
            </TouchableOpacity>

            {history.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={[styles.dot, item.read && styles.dotRead]} />

                <View style={styles.body}>
                  {!!item.title && <Text style={styles.title}>{item.title}</Text>}
                  {!!item.body && <Text style={styles.text}>{item.body}</Text>}
                  <Text style={styles.date}>
                    {ConvertApiTimeToLocal(
                      new Date(item.receivedAt).toISOString(),
                      i18n.language,
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </Wrapper>
  );
};

export default NotificationsPage;
