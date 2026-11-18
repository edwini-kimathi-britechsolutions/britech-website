"use client";

/** Last-resort error page (used if the root layout itself fails). Kept dependency-free. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, color: "#191d40" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>Britech Solutions</h1>
          <p>Sorry, something went wrong loading the site.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: "10px 18px", borderRadius: 8, border: 0, background: "#191d40", color: "#fff", cursor: "pointer" }}>
            Try again
          </button>
          <p style={{ marginTop: 20, fontSize: 14, color: "#52566f" }}>info@britechsolutions.co.tz · +255 795 005 903</p>
        </div>
      </body>
    </html>
  );
}
