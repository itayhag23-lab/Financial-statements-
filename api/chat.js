module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Add it in your Vercel project settings.' });
  }

  // Model is overridable via env var so it can be changed without a code deploy.
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  try {
    const { messages = [], system, max_tokens } = req.body;

    // Translate Anthropic-format messages → Gemini contents
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : (m.content || []).map(c => c.text || '').join('') }]
    }));

    // The v1 endpoint does not support the separate `systemInstruction` field,
    // so we fold the system prompt into the first user turn. This works across
    // every Gemini model/version and avoids "Unknown name systemInstruction".
    if (system) {
      const firstUser = contents.find(c => c.role === 'user');
      if (firstUser) {
        firstUser.parts[0].text = system + '\n\n---\n\n' + firstUser.parts[0].text;
      } else {
        contents.unshift({ role: 'user', parts: [{ text: system }] });
      }
    }

    const geminiReq = {
      contents,
      generationConfig: { maxOutputTokens: max_tokens || 2048 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiReq)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }

    // Translate Gemini response → Anthropic format so the frontend needs no changes
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
