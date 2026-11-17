import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Link preview image used by WhatsApp, LinkedIn, Facebook, X, etc.
export const alt = "Britech Solutions | Driven by Innovation. Powered by Technology.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/images/logo-white.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f1029 0%, #1a1c45 60%, #00826c 140%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} alt="" height={96} style={{ height: 96 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>Smart, secure & scalable</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, color: "#4fdcba" }}>digital systems.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#c7cae6" }}>
            Software · Cybersecurity · Data & BI · ERP · AI · Arusha, Tanzania
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#9a9fcf" }}>britechsolutions.co.tz</div>
      </div>
    ),
    size
  );
}
