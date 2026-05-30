import { useState } from "react";
import Modal from "react-modal";
import { saveApiKey } from "./api";

Modal.setAppElement("#root");

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [agent, setAgent] = useState("detailed");
  const [model, setModel] = useState("gemini-1.5-flash-latest");
  const [agentInput, setAgentInput] = useState("");

  const handleSave = async () => {
    await saveApiKey(apiKey, model, agent, agentInput);
    setShowModal(false);
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">⚙️ Settings</h2>

      <div className="field">
        <label>Agent</label>
        <select onChange={(e) => setAgent(e.target.value)}>
          <option value="detailed">Detailed Notes</option>
          <option value="summary">Quick Summary</option>
          <option value="bullet">Bullet Points</option>
          <option value="custom">Custom Prompt</option>
        </select>
      </div>

      {/* ✅ Show extra input for custom agent */}
      {agent === "custom" && (
        <div className="field">
          <label>Custom Prompt</label>
          <input
            type="text"
            placeholder="Enter your instruction..."
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
          />
        </div>
      )}

      <div className="field">
        <label>Model</label>
        <select onChange={(e) => setModel(e.target.value)}>
          <option value="gemini-1.5-flash-latest">
            gemini-1.5-flash-latest (Free ✅)
          </option>
          <option value="gemini-1.0-pro">
            gemini-1.0-pro
          </option>
        </select>
      </div>

      <button className="api-btn" onClick={() => setShowModal(true)}>
        Set API Key
      </button>

      {/* ✅ Compact Modal */}
      <Modal isOpen={showModal} className="modal">
        <h3>Enter API Key</h3>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}