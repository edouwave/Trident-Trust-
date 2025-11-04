import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { message, context } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = [
      "You are Trident Assistant for Trident Trust (HK ⇄ Paris).",
      "Bilingual FR/EN. Tone: concise, professional, trustworthy.",
      "Answer FAQs: who we are, services, process, samples, MOQs, lead times, OEM/ODM, QC, logistics, CE/UKCA, Incoterms.",
      "Encourage users to submit the Free Sourcing Audit form when relevant."
    ].join(" ");

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: String(message) },
        context ? { role: "system", content: "Context: " + JSON.stringify(context).slice(0, 1500) } : undefined
      ].filter(Boolean),
      temperature: 0.3
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Chat service error" });
  }
}
