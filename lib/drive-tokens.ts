import "server-only"

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

function getEncryptionKey() {
  const encodedKey = process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY
  if (!encodedKey) throw new Error("Missing GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY")

  const key = Buffer.from(encodedKey, "base64")
  if (key.length !== 32) {
    throw new Error("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key")
  }
  return key
}

export function encryptDriveToken(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map((part) => part.toString("base64")).join(".")
}

export function decryptDriveToken(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".")
  if (!ivText || !tagText || !encryptedText) throw new Error("Invalid encrypted Drive token")

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivText, "base64"),
  )
  decipher.setAuthTag(Buffer.from(tagText, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final(),
  ]).toString("utf8")
}
