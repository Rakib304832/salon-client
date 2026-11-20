import { api } from "./client";
import type { UploadResponse } from "@/types";

/**
 * Image upload endpoint.
 *
 * The browser sends the raw File to the Express server as multipart field
 * "image". The server forwards it to ImgBB with its private API key and returns
 * { url }. No ImgBB key ever reaches this repository or the browser bundle.
 */
export const uploadsApi = {
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<UploadResponse>("/api/uploads", { rawBody: formData });
  },
};
