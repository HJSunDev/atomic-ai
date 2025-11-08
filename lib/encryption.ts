import CryptoJS from "crypto-js";

/**
 * 使用AES算法加密数据。
 *
 * @param data - 需要加密的明文字符串。
 * @param secretKey - 用于加密的密钥。
 * @returns 返回加密后的Base64编码字符串。
 */
export function encrypt(data: string, secretKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, secretKey);
  return encrypted.toString();
}

/**
 * 使用AES算法解密数据。
 *
 * @param encryptedData - 经过加密并以Base64编码的字符串。
 * @param secretKey - 用于解密的密钥。
 * @returns 如果解密成功，返回原始的明文字符串；如果解密失败（如密钥错误），则返回null。
 */
export function decrypt(encryptedData: string, secretKey: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // 如果解密后得到空字符串，说明密钥可能错误或数据损坏，视为解密失败。
    return originalText || null;
  } catch (error) {
    // 在解密过程中发生任何异常，都安全地返回null。
    console.error("解密失败:", error);
    return null;
  }
}
