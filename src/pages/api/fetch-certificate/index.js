export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  try {
    const r = await fetch(url, { redirect: "follow" });
    if (!r.ok) return res.status(502).send("Fetch failed");

    const html = await r.text();
    const sanitized = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(sanitized);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
}
