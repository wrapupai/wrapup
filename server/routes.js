const express = require("express");
const router = express.Router();
const { getSubtitles } = require("youtube-caption-extractor");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
 const { Document, Packer, Paragraph, TextRun } = require("docx");
const { getApiKey, setApiKey } = require("./config");

// Extract video ID
const extractVideoId = (url) => {
  const match = url.match(
    /(?:youtube\.com.*(?:\?v=|\/embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

// ✅ Save Gemini API key
router.post("/settings", (req, res) => {
  const { apiKey } = req.body;
  setApiKey(apiKey);
  res.json({ message: "API Key saved ✅" });
});

// ✅ Main endpoint
router.post("/get-ai-notes", async (req, res) => {
  try {
    const { url, model, agent } = req.body;
    const format = "docx";

    const videoID = extractVideoId(url);

    if (!videoID) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Fetch subtitles
    const subtitles = await getSubtitles({
      videoID,
      lang: "en",
    });

    // ✅ Sanitize → keep only text
    const cleanTranscript = subtitles
      .map((s) => s.text)
      .join(" ")
      .slice(0, 15000); // prevent large payloads

    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(400).json({ error: "Gemini API key not set" });
    }

    // ✅ Agent-based prompt
prompt = `
Create well-structured notes from this transcript.

Rules:
- Use clear headings in uppercase
- Use bullet points where appropriate
- Add spacing between sections
- Keep it readable and clean
- Use subheadings ending with colon :
- Use simple "-" for bullet points
- DO NOT include markdown symbols like **, #, *, - etc.
- Keep clean spacing


Transcript:
${cleanTranscript}
`;

    // ✅ Use selected model or fallback
    const selectedModel = model || "gemini-2.5-flash";

    // ✅ Gemini request
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\n${cleanTranscript}`,
              },
            ],
          },
        ],
      }
    );

    let notes =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No notes generated.";


notes = notes
  .replace(/\*\*/g, "")   // remove **
  .replace(/\*/g, "")     // remove *
  .replace(/#+/g, "")     // remove #
  .replace(/>/g, "")      // remove >
  .replace(/^\s*-+\s*/gm, "- ") // normalize bullets
  .trim();


    // ✅ File generation
    const fileName = `notes_${Date.now()}`;
    let filePath = "";

    if (format === "docx") {
      const doc = new Document({
        sections: [
          {
            children: formatDoc(notes), 
          },
        ],
      });

      filePath = path.join(__dirname, `${fileName}.docx`);
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);

    } else {
      // default PDF
      const pdf = new PDFDocument();
      filePath = path.join(__dirname, `${fileName}.pdf`);

      pdf.pipe(fs.createWriteStream(filePath));
      pdf.text(notes);
      pdf.end();
    }

function formatDoc(notes) {
  const lines = notes.split("\n");

  return lines.map((line) => {
    let trimmed = line.trim();

    if (!trimmed) {
      return new Paragraph("");
    }

    // ✅ Remove leftover symbols again (safety)
    trimmed = trimmed.replace(/^[-•]\s*/, "");

    // ✅ MAIN HEADING (ALL CAPS)
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 6 &&
      !trimmed.endsWith(":")
    ) {
      return new Paragraph({
        text: trimmed,
        heading: "Heading1"
      });
    }

    // ✅ SUB-HEADING (ends with :)
    if (trimmed.endsWith(":")) {
      return new Paragraph({
        text: trimmed.replace(/:$/, ""),
        heading: "Heading2"
      });
    }

    // ✅ BULLETS
    if (
      line.trim().startsWith("-") ||
      line.trim().startsWith("•")
    ) {
      return new Paragraph({
        text: trimmed,
        bullet: { level: 0 }
      });
    }

    // ✅ NORMAL TEXT
    return new Paragraph({
      text: trimmed,
      spacing: { after: 120 }
    });
  });
}

    res.json({
      notes,
      transcript: cleanTranscript,
      thumbnail: `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`,
      file: `/${path.basename(filePath)}` // 👈 important for download
    });

  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

module.exports = router;