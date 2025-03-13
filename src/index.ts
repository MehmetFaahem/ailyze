import axios from "axios";

// Conditionally import cloudinary only in Node.js environment
let cloudinary: any = null;
const isNodeEnvironment =
  typeof process !== "undefined" && process.versions && process.versions.node;

if (isNodeEnvironment) {
  // Only import cloudinary in Node.js environment
  try {
    const cloudinaryModule = require("cloudinary");
    cloudinary = cloudinaryModule.v2;
  } catch (error) {
    console.warn("Cloudinary import failed:", error);
  }
}

// Types for our package
export interface AilyzeConfig {
  cloudflareApiKey: string;
  cloudflareAccountId: string;
  cloudinaryConfig?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

export interface GeneratePhotoResponse {
  image_url: string;
  success: boolean;
  error?: string;
}

export interface OptimizeTextResponse {
  enhanced: string;
  success: boolean;
  error?: string;
}

// Global configuration
let config: AilyzeConfig | null = null;

/**
 * Initialize the Ailyze package with your API credentials
 * @param ailyzeConfig Configuration object with API keys
 */
export function initialize(ailyzeConfig: AilyzeConfig): void {
  config = ailyzeConfig;

  // Initialize Cloudinary if config is provided and in Node.js environment
  if (config.cloudinaryConfig && isNodeEnvironment && cloudinary) {
    cloudinary.config({
      cloud_name: config.cloudinaryConfig.cloudName,
      api_key: config.cloudinaryConfig.apiKey,
      api_secret: config.cloudinaryConfig.apiSecret,
    });
  } else if (config.cloudinaryConfig && !isNodeEnvironment) {
    console.warn(
      "Cloudinary is not supported in browser environments. The cloudinaryConfig will be ignored."
    );
  }
}

/**
 * Generate an image based on the provided text prompt
 * @param prompt Text description of the image to generate
 * @returns Promise with the generated image URL
 */
export async function generatePhoto(
  prompt: string
): Promise<GeneratePhotoResponse> {
  try {
    // Check if the package is initialized
    if (!config) {
      throw new Error(
        "Ailyze package not initialized. Call initialize() first."
      );
    }

    // Make request to Cloudflare Workers AI API for image generation
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${config.cloudflareAccountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${config.cloudflareApiKey}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Convert the image buffer to base64
    const imageBuffer = Buffer.from(response.data);

    // If Cloudinary config is provided and in Node.js environment, upload to Cloudinary
    if (config.cloudinaryConfig && isNodeEnvironment && cloudinary) {
      // Upload to Cloudinary
      const uploadResponse = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image" },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(imageBuffer);
      });

      return {
        image_url: uploadResponse.secure_url,
        success: true,
      };
    } else {
      // If no Cloudinary config or in browser environment
      // If no Cloudinary config, convert to base64 data URL
      const base64Image = `data:image/png;base64,${imageBuffer.toString(
        "base64"
      )}`;
      return {
        image_url: base64Image,
        success: true,
      };
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      image_url: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Optimize and enhance the provided text using AI
 * @param prompt Text to optimize
 * @returns Promise with the enhanced text
 */
export async function optimizeText(
  prompt: string
): Promise<OptimizeTextResponse> {
  try {
    // Check if the package is initialized
    if (!config) {
      throw new Error(
        "Ailyze package not initialized. Call initialize() first."
      );
    }

    // Make request to Cloudflare Workers AI API for text optimization
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${config.cloudflareAccountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`,
      {
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that optimizes and enhances text to make it more professional, clear, and engaging.",
          },
          {
            role: "user",
            content: `Please optimize and enhance the following text: ${prompt}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${config.cloudflareApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      enhanced: response.data.result.response,
      success: true,
    };
  } catch (error) {
    console.error("Error optimizing text:", error);
    return {
      enhanced: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
