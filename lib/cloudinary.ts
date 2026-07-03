import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/**
 * Signs upload params so the browser can upload directly to Cloudinary,
 * bypassing our own serverless function entirely. Vercel caps serverless
 * request bodies around 4.5MB — talent portfolio videos (up to 100MB) would
 * fail if proxied through our own API route, so the file never touches it.
 */
export function signCloudinaryUpload(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const fullFolder = `volcano-arts/${folder}`
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: fullFolder },
    process.env.CLOUDINARY_API_SECRET!
  )
  return {
    timestamp,
    folder: fullFolder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  }
}
