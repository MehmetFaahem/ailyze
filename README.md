# Ailyze

A Node.js package that provides AI-powered image generation and text optimization using Cloudflare Workers AI. Generated image will be stored to Cloudinary if you provide credentials of Cloudinary. This package provides a simple and efficient way to generate images and optimize texts using AI.

## Features

- **Image Generation**: Generate images from text prompts
- **Text Optimization**: Enhance and optimize texts
- **Cloudinary Integration**: Optional integration with Cloudinary for image storage

## Installation

```bash
npm install ailyze
# or
yarn add ailyze
```

## Usage

### Instructions

1. Create a Cloudflare account and obtain your API key and account ID
2. Set up Cloudinary for image storage (optional)

### Implementation

 <p style='color: red; font-size: 16px'> In Next JS: Use api route to call the functions. </p>

```javascript
import { initialize, generatePhoto, optimizeText } from "ailyze";
import { NextResponse } from "next/server";

// Initialize ailyze with credentials
initialize({
  cloudflareApiKey: process.env.CLOUDFLARE_API_KEY!,
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  cloudinaryConfig: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!, // Optional
    apiKey: process.env.CLOUDINARY_API_KEY!, // Optional
    apiSecret: process.env.CLOUDINARY_API_SECRET!, // Optional
  },
});

export async function POST(request: Request) {
  try {
    const { type, prompt } = await request.json();

    if (type === "image") {
      const result = await generatePhoto(prompt);
      return NextResponse.json(result);
    }

    if (type === "text") {
      const result = await optimizeText(prompt);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid type specified" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

```

<p style='color: red; font-size: 16px'> In Express JS: </p>

```javascript
import express from "express";
import dotenv from "dotenv";
import { initialize, generatePhoto, optimizeText } from "ailyze";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize ailyze with credentials
initialize({
  cloudflareApiKey: process.env.CLOUDFLARE_API_KEY,
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  cloudinaryConfig: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME, // Optional
    apiKey: process.env.CLOUDINARY_API_KEY, // Optional
    apiSecret: process.env.CLOUDINARY_API_SECRET, // Optional
  },
});

app.post("/generate", async (req, res) => {
  try {
    const { type, prompt } = req.body;

    if (type === "image") {
      const result = await generatePhoto(prompt);
      return res.json(result);
    }

    if (type === "text") {
      const result = await optimizeText(prompt);
      return res.json(result);
    }

    return res.status(400).json({ error: "Invalid type specified" });
  } catch (error) {
    return res.status(500).json({ error: "Processing failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Initialize the Package

First, initialize the package with your Cloudflare API credentials:

```javascript
import { initialize, generatePhoto, optimizeText } from "ailyze";

// Initialize with Cloudflare credentials
initialize({
  cloudflareApiKey: process.env.CLOUDFLARE_API_KEY,
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  // Optional: Cloudinary configuration for image storage
  cloudinaryConfig: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME, // Optional
    apiKey: process.env.CLOUDINARY_API_KEY, // Optional
    apiSecret: process.env.CLOUDINARY_API_SECRET, // Optional
  },
});
```

### Env Variables

```bash
CLOUDFLARE_API_KEY=your_api_key
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDINARY_CLOUD_NAME=your_cloud_name (Optional)
CLOUDINARY_API_KEY=your_api_key (Optional)
CLOUDINARY_API_SECRET=your_api_secret (Optional)
```

### Generate an Image

```javascript
const generateImage = async () => {
  const result = await generatePhoto("A beautiful sunset over mountains");

  if (result.success) {
    // Use the image URL
    console.log("Generated image URL:", result.image_url);
  } else {
    console.error("Error generating image:", result.error);
  }
};
```

### Optimize Text

```javascript
const enhanceText = async () => {
  const result = await optimizeText(
    "This is a simple text that needs improvement"
  );

  if (result.success) {
    // Use the enhanced text
    console.log("Enhanced text:", result.enhanced);
  } else {
    console.error("Error optimizing text:", result.error);
  }
};
```

## API Reference

### `initialize(config)`

Initializes the package with your API credentials.

**Parameters:**

- `config` (Object): Configuration object with the following properties:
  - `cloudflareApiKey` (string): Your Cloudflare API key
  - `cloudflareAccountId` (string): Your Cloudflare account ID
  - `cloudinaryConfig` (Object, optional): Cloudinary configuration
    - `cloudName` (string): Your Cloudinary cloud name
    - `apiKey` (string): Your Cloudinary API key
    - `apiSecret` (string): Your Cloudinary API secret

### `generatePhoto(prompt)`

Generates an image based on the provided text prompt.

**Parameters:**

- `prompt` (string): Text description of the image to generate

**Returns:**

- Promise that resolves to an object with:
  - `image_url` (string): URL of the generated image
  - `success` (boolean): Whether the operation was successful
  - `error` (string, optional): Error message if unsuccessful

### `optimizeText(prompt)`

Optimizes and enhances the provided text using AI.

**Parameters:**

- `prompt` (string): Text to optimize

**Returns:**

- Promise that resolves to an object with:
  - `enhanced` (string): The enhanced text
  - `success` (boolean): Whether the operation was successful
  - `error` (string, optional): Error message if unsuccessful

## Notes

- This package requires a Cloudflare account with Workers AI access
- For production use, it's recommended to use Cloudinary for image storage
- If Cloudinary configuration is not provided, images will be returned as base64 data URLs
