import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getNotes = (url, model) =>
  API.post("/get-ai-notes", {
    url,
    model
  });

export const saveApiKey = (apiKey, model) =>
  API.post("/settings", { apiKey, model });