// app/opengraph-image.js
//
// The default social-share card. Next.js applies this to every route that
// doesn't define its own opengraph-image — homepage, archive, legal pages,
// all of it — so link previews on LinkedIn/X/Product Hunt show something
// branded instead of a blank card.

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              backgroundColor: "#18181b",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 600, color: "#71717a", letterSpacing: "-0.01em" }}>
            Daily AI Pulse
          </div>
        </div>
        <div
          style={{
            marginTop: "36px",
            fontSize: 66,
            fontWeight: 700,
            color: "#18181b",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "940px",
          }}
        >
          The one AI story that matters today.
        </div>
        <div style={{ marginTop: "28px", fontSize: 30, color: "#52525b", maxWidth: "820px" }}>
          No digests. No jargon. One email, one story, every morning.
        </div>
      </div>
    ),
    { ...size }
  );
}
