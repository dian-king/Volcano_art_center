/** Client-side helper: signs with our server, then uploads the file straight
 *  to Cloudinary — the file bytes never pass through our own serverless
 *  function, so there's no Vercel request-body-size ceiling to worry about. */
export async function uploadToCloudinaryClient(file: File, folder: string): Promise<{ url?: string; error?: string }> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  })
  const sign = await signRes.json()
  if (sign.error) return { error: sign.error }

  const fd = new FormData()
  fd.append("file", file)
  fd.append("api_key", sign.apiKey)
  fd.append("timestamp", String(sign.timestamp))
  fd.append("signature", sign.signature)
  fd.append("folder", sign.folder)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: "POST",
    body: fd,
  })
  const uploaded = await uploadRes.json()
  if (uploaded.error) return { error: uploaded.error.message ?? "Upload failed" }
  return { url: uploaded.secure_url }
}
