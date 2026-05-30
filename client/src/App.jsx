import { useState, useRef, useEffect } from "react";
import { getNotes, saveApiKey } from "./api";
import appLogo from '../../client/public/WrapUp.png';
import "./styles.css";

export default function App() {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [url, setUrl] = useState("");
  const urlRef = useRef(null);
  const ready = model && apiKey;
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [notes, setNotes] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (ready) {
      setTimeout(() => {
        const el = urlRef.current;

        if (!el) return;

        const y =
          el.getBoundingClientRect().top +
          window.pageYOffset -
          window.innerHeight / 2 +
          el.offsetHeight / 2;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }, 300);
    }
  }, [ready]);


  const extractVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com.*(?:\?v=|\/embed\/)|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const handleUrlChange = (inputValue) => {
    setUrl(inputValue); // Keep state synced

    const id = extractVideoId(inputValue);

    if (id) {
      setIsValid(true);
      setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);

      // ✅ Smooth scroll to URL + preview
      setTimeout(() => {
        urlRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    } else {
      setIsValid(false);
      setThumbnail(""); // Reset thumbnail if the URL becomes invalid
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);

      await saveApiKey(apiKey, model);

      const res = await getNotes(url, model);

      const link = document.createElement("a");
      link.href = `http://localhost:5000${res.data.file}`;
      link.download = true;
      link.click();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="main">
        <div className="container">
          <h1 className="logo">
             <img src={appLogo} alt="WrapUp Logo" className="logo-icon" />
            <div className="logo-text-group">
            WrapUp
            <span>Watch less. Know more.</span>
  </div>
          </h1>
        </div>

        {/* Row 1: Model and API Key Selection */}
        <div className="top-row">
          <div className="field">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="">Select model</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Free)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Free)</option>
              <option value="gemini-2.0-pro">gemini-2.0-pro</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash</option>
            </select>
          </div>

          <div className="field">
            <label>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
            />
          </div>
        </div>

        {/* Row 2: URL Section (Forces a break below Row 1) */}
        <div className="url-section" ref={urlRef}>
          <div className={`input-box ${isValid ? "valid" : ""}`}>
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)} // 🚀 Triggers instantly on paste/type
            />
            <button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "WrapUp!"}
            </button>
          </div>
        </div>

        {/* Row 3: Thumbnail Box */}
        {thumbnail && (
          <div className="thumb-wrapper">
            <img src={thumbnail} className="thumb" alt="preview" />
          </div>
        )}
      </div>
    </div>
  );
}
