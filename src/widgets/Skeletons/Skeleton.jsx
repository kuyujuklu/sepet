import { memo, useEffect } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// One pulse for the whole app instead of one per block: a loading screen shows
// six to ten of these, and six to ten animation loops for the same effect is
// pure waste. The loop runs only while at least one skeleton is mounted.
const pulse = new Animated.Value(0.45);
let mounted = 0;
let animation = null;

const startPulse = () => {
  mounted += 1;
  if (animation) return;

  animation = Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0.45,
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]),
  );

  animation.start();
};

const stopPulse = () => {
  mounted -= 1;
  if (mounted > 0 || !animation) return;

  animation.stop();
  animation = null;
  pulse.setValue(0.45);
};

// One pulsing grey block. Everything that loads in this app is a list of cards,
// so the loading state is built out of these instead of a lone spinner: the
// screen keeps its shape and the wait stops looking like a freeze.
export const Skeleton = memo(({ width = "100%", height = 16, radius = 8, style }) => {
  useEffect(() => {
    startPulse();

    return stopPulse;
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "#e2e2e5",
          opacity: pulse,
        },
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  cardBody: {
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
  },
  rowTexts: {
    flex: 1,
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  list: {
    gap: 10,
    paddingHorizontal: 16,
  },
});

// Placeholder of a TopDishCard
export const DishCardSkeleton = memo(({ width }) => (
  <View style={[styles.card, { width }]}>
    <Skeleton width="100%" height={130} radius={0} />
    <View style={styles.cardBody}>
      <Skeleton width="85%" height={13} />
      <Skeleton width="55%" height={11} />
      <Skeleton width="40%" height={15} />
    </View>
  </View>
));

export const DishGridSkeleton = ({ cardWidth, count = 6 }) => (
  <View style={styles.grid}>
    {Array.from({ length: count }).map((_, index) => (
      <DishCardSkeleton key={index} width={cardWidth} />
    ))}
  </View>
);

// Placeholder of a row with a thumbnail (basket item, pub card, dish row)
export const RowSkeleton = ({ thumbSize = 64 }) => (
  <View style={styles.row}>
    <Skeleton width={thumbSize} height={thumbSize} radius={14} />
    <View style={styles.rowTexts}>
      <Skeleton width="70%" height={13} />
      <Skeleton width="45%" height={11} />
    </View>
    <Skeleton width={72} height={30} radius={15} />
  </View>
);

export const RowsSkeleton = ({ count = 4, thumbSize }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, index) => (
      <RowSkeleton key={index} thumbSize={thumbSize} />
    ))}
  </View>
);

// Placeholder of a big card (a pub / category card of the "establishments" view)
export const BigCardSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    <Skeleton width="100%" height={160} radius={24} />
  </View>
);

export const BigCardsSkeleton = ({ count = 3 }) => (
  <View style={{ gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <BigCardSkeleton key={index} />
    ))}
  </View>
);

export default Skeleton;
