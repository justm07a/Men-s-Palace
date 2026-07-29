const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(file: File): UploadValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type '${file.type}' is not allowed` };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File extension '.${ext}' is not allowed` };
  }

  if (file.type !== "image/svg+xml" && ext !== "svg") {
    const extToMime: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      gif: "image/gif", webp: "image/webp",
    };
    if (extToMime[ext] !== file.type) {
      return { valid: false, error: "File extension does not match content type" };
    }
  }

  return { valid: true };
}

export async function validateFileMagicBytes(buffer: Buffer, mimeType: string): Promise<UploadValidationResult> {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return { valid: true };

  for (const magic of expected) {
    const match = magic.every((byte, i) => buffer[i] === byte);
    if (match) return { valid: true };
  }

  return { valid: false, error: "File content does not match declared type" };
}
