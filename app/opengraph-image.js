import { ImageResponse } from "next/server";

// Site-wide fallback link-preview image (WhatsApp/Instagram/Facebook), used
// wherever a route doesn't provide its own - see pub/[pubID]/layout.js for
// the one place that does (the pub's own cover photo instead). Generated
// rather than a static asset because nothing in public/images/ is a proper
// landscape banner - the closest existing files are product shots of a
// literal basket, with no wordmark or text.
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #17457A 0%, #1E6FBF 45%, #2D7DD2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 108, fontWeight: 800, color: "#fff", letterSpacing: -2 }}>
          sepet.md
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#DCEBFA", marginTop: 22 }}>
          Еда · Цветы · Продукты — доставка по югу Молдовы
        </div>
      </div>
    ),
    { ...size }
  );
}
