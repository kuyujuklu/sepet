const navbarZIndex = 100

export const styles = {
  navbarWrapper: {
    backgroundColor: "rgb(242, 242, 242)",
    position: "relative",
    flex: 1,
  },
  navbarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#fff",
  },
  navbarButton: {
    width: 50,
    height: 50,
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
