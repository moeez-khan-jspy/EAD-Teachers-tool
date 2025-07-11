import { ChatGroq } from '@langchain/groq';

export const modelConfig = {
  model: "llama-3.3-70b-versatile",
  temperature: 0.5
};

// Create a function to update the API key
export const updateApiKey = (newApiKey) => {
  localStorage.setItem('groqApiKey', newApiKey);
};

// Factory function to get a ChatGroq model if the API key exists
export function getGroqModel() {
  const apiKey = localStorage.getItem('groqApiKey');
  if (!apiKey) return null;
  return new ChatGroq({ ...modelConfig, apiKey });
}
