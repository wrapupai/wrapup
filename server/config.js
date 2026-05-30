let GEMINI_API_KEY = "";

module.exports = {
  setApiKey: (key) => {
    GEMINI_API_KEY = key;
  },
  getApiKey: () => GEMINI_API_KEY,
};