import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI travel assistant for a ride-sharing platform." },
        { role: "user", content: message },
      ],
    });
    const reply = completion.choices?.[0]?.message?.content ?? "No response.";
    res.json({ reply });
  } catch (e) {
    console.error("AI error:", e);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};
