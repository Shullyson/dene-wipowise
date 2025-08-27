import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { BlobServiceClient } from "@azure/storage-blob";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('dist')); 

// Proxy endpoint to Azure Function
const AZURE_FUNCTION_URL = process.env.AZURE_FUNCTION_URL;
const AZURE_FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY;

const AZURE_STORAGE_CONNECTION_STRING = "";
const containerName = "feedback"; // Use an existing or create a new container

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ask AI endpoint
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log('Received message:', message);
    if (!message) {
      console.error('No message provided');
      return res.status(400).json({ error: 'Message is required.' });
    }
    if (!AZURE_FUNCTION_URL || !AZURE_FUNCTION_KEY) {
      console.error('Azure Function URL or key not set');
      return res.status(500).json({ error: 'Azure Function URL or key not set.' });
    }
    const azureUrl = `${AZURE_FUNCTION_URL}?code=${AZURE_FUNCTION_KEY}`;
    console.log('Proxying to Azure Function:', azureUrl);
    try {
      const response = await fetch(azureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history || [] })
      });
      console.log('Azure Function response status:', response.status);
      const data = await response.json();
      console.log('Azure Function response data:', data);
      res.json({ answer: data.answer || 'No response', raw: data });
    } catch (fetchError) {
      console.error('Error fetching from Azure Function:', fetchError);
      res.status(502).json({ error: 'Failed to fetch from Azure Function', details: fetchError.message });
    }
  } catch (error) {
    console.error('Error in /api/ask-ai:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

// Feedback endpoint

app.post('/api/feedback', async (req, res) => {
  try {
    const { query, response, feedback, timestamp } = req.body;
    const blobName = "feedback.json";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Try to download existing feedback.json
    let feedbacks = [];
    try {
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
      feedbacks = JSON.parse(downloaded);
      if (!Array.isArray(feedbacks)) feedbacks = [];
    } catch (err) {

      feedbacks = [];
    }

    // Append new feedback
    feedbacks.push({ query, response, feedback, timestamp });

    // Upload updated feedbacks array
    const data = JSON.stringify(feedbacks, null, 2);
    await blockBlobClient.upload(data, Buffer.byteLength(data), { overwrite: true });

    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save feedback to Azure Blob Storage", details: error.message });
  }
});

// Helper to convert stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});