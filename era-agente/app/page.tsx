export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
      <h1>💅 Era Nails &amp; Hair</h1>
      <p>Agente de WhatsApp activo.</p>
      <ul>
        <li>Webhook: <code>/api/webhook/ycloud</code></li>
        <li>Estado: <strong style={{ color: "green" }}>online</strong></li>
      </ul>
      <p style={{ color: "#888", fontSize: 14 }}>
        Configura este URL en tu panel de YCloud → Webhooks.
      </p>
    </main>
  );
}
