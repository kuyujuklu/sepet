
export const styles = {
  navbarWrapper: {
    position: "absolute",
    width: "100%",
    height: 50,
    bottom: 0,
    flex: 1,
  },
  navbarContainer: {
    position: "relative",
    backgroundColor: "#fff",
    paddingVertical: 10,

    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#fff",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
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
