/**
 * Utility functions for interacting with Cloudflare R2 bucket.
 * Intended to run within the Cloudflare Workers / Next-on-Pages context 
 * where \`env.STORAGE\` is bound correctly via getRequestContext().
 */

export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: string | ReadableStream | ArrayBuffer,
  contentType: string = "text/plain"
) {
  try {
    const result = await bucket.put(key, data, {
      httpMetadata: { contentType },
    });
    return result;
  } catch (error) {
    console.error("Failed to upload to R2:", error);
    throw new Error("R2 Upload failed");
  }
}

export async function getFromR2(bucket: R2Bucket, key: string) {
  try {
    const object = await bucket.get(key);
    if (!object) return null;
    return object;
  } catch (error) {
    console.error("Failed to fetch from R2:", error);
    throw new Error("R2 read failed");
  }
}

export async function deleteFromR2(bucket: R2Bucket, key: string) {
  try {
    await bucket.delete(key);
    return true;
  } catch (error) {
    console.error("Failed to delete from R2:", error);
    throw new Error("R2 delete failed");
  }
}
