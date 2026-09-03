// Small circular avatar for compact courier displays (order-detail card,
// lists) - the courier's photo when they've uploaded one, their initial on
// the same brand-tinted circle otherwise. Not CourierProfileImage: that one
// is a fixed 300px upload widget, way too big to sit inline in a card row.
const CourierAvatar = ({ courier, size = 38 }) => {
  const initial = courier?.full_name?.trim()?.[0]?.toUpperCase();

  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden font-semibold"
      style={{
        width: size,
        height: size,
        background: "#e8f1fb",
        color: "#2D7DD2",
        fontSize: size * 0.4,
      }}
    >
      {courier?.image_file_name ? (
        <img
          src={`/api-static/images/courier/${courier.image_file_name}`}
          alt={courier?.full_name || ""}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initial || "?"
      )}
    </div>
  );
};

export default CourierAvatar;
