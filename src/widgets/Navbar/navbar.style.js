import { Platform } from "react-native";

export const styles = {
  navbarWrapper: {
    position: "absolute",
    width: "100%",
    height: Platform.OS === "ios" ? 75 : 60,
    bottom: 0,
    flex: 1,
  },
  navbarContainer: {
    position: "relative",
    backgroundColor: "#fff",
    // paddingBottom: 30,

    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    // height: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#fff",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  navbarButton: {
    width: 60,
    height: 60,
  },
  expandMore: (expanded) => ({
    backgroundColor: "#fff",
    color: expanded ? "#000" : "#fff",
    position: "absolute",
    top: "-100%",
    right: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  }),
};
