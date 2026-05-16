import crypto from "node:crypto";

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, expectedHash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      const actual = Buffer.from(derivedKey.toString("hex"), "hex");
      const expected = Buffer.from(expectedHash, "hex");
      resolve(actual.length === expected.length && crypto.timingSafeEqual(actual, expected));
    });
  });
}

export function generateApiKey() {
  return crypto.randomBytes(24).toString("base64url");
}
