import { useState } from "react";
import { saveApiKey } from "./api";

export default function Settings() {
  const [key, setKey] = useState("");

  const save = async () => {
    await saveApiKey(key);
    alert("✅ Gemini API Key Saved");
  };

  return (
    <div className="Settings">
      <h3>⚙️ Settings</h3>
      <input
        type="text"
        placeholder="Enter Gemini API Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button onClick={save}>Save</button>
    </div>
  );
}