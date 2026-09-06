import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Set authenticator options (window of 1 allows ±30 seconds clock drift)
authenticator.options = {
  window: 1,
};

export interface StoredRecoveryCode {
  id: string;
  hash: string;
  used: boolean;
  used_at: string | null;
}

export interface PendingMfaPayload {
  id: number;
  userType: 'pengguna' | 'anggota';
  identifier: string;
  nama: string;
  peran?: string;
  exp: number;
}

const MFA_SECRET_KEY = process.env.MFA_SECRET_KEY || 'perpustakaan-secure-mfa-token-key-2026';

/**
 * Normalizes recovery code input (e.g. "abcd-1234" -> "ABCD1234")
 */
export function normalizeRecoveryCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Hashes a recovery code with SHA-256
 */
export function hashRecoveryCode(code: string): string {
  const normalized = normalizeRecoveryCode(code);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generates an MFA secret and otpauth URI
 */
export function generateMfaSecret(accountLabel: string, issuer = 'Perpustakaan'): { secret: string; otpauthUrl: string } {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(accountLabel, issuer, secret);
  return { secret, otpauthUrl };
}

/**
 * Generates QR Code Data URL (PNG base64)
 */
export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Verifies a 6-digit TOTP token against a secret
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    const cleanToken = token.trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanToken)) {
      return false;
    }
    return authenticator.check(cleanToken, secret);
  } catch (err) {
    console.error('Error verifying TOTP token:', err);
    return false;
  }
}

/**
 * Generates random readable recovery codes (format: ABCD-1234)
 */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude 0, 1, I, O to prevent confusion

  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    const bytes = crypto.randomBytes(8);
    for (let j = 0; j < 4; j++) {
      part1 += chars[bytes[j] % chars.length];
      part2 += chars[bytes[j + 4] % chars.length];
    }
    codes.push(`${part1}-${part2}`);
  }

  return codes;
}

/**
 * Prepares array of StoredRecoveryCode objects with hashes from plain codes
 */
export function createStoredRecoveryCodes(plainCodes: string[]): StoredRecoveryCode[] {
  return plainCodes.map((code, index) => ({
    id: `rc_${index + 1}_${Date.now().toString(36)}`,
    hash: hashRecoveryCode(code),
    used: false,
    used_at: null,
  }));
}

/**
 * Checks and consumes a single-use recovery code
 */
export function verifyAndConsumeRecoveryCode(
  inputCode: string,
  storedCodesJson: string | null
): { valid: boolean; updatedCodesJson: string | null; remainingCount: number } {
  if (!storedCodesJson) {
    return { valid: false, updatedCodesJson: null, remainingCount: 0 };
  }

  try {
    const codes: StoredRecoveryCode[] = JSON.parse(storedCodesJson);
    if (!Array.isArray(codes)) {
      return { valid: false, updatedCodesJson: null, remainingCount: 0 };
    }

    const inputHash = hashRecoveryCode(inputCode);
    const codeIndex = codes.findIndex((c) => !c.used && c.hash === inputHash);

    if (codeIndex === -1) {
      const remaining = codes.filter((c) => !c.used).length;
      return { valid: false, updatedCodesJson: null, remainingCount: remaining };
    }

    codes[codeIndex].used = true;
    codes[codeIndex].used_at = new Date().toISOString();

    const remaining = codes.filter((c) => !c.used).length;
    return {
      valid: true,
      updatedCodesJson: JSON.stringify(codes),
      remainingCount: remaining,
    };
  } catch (err) {
    console.error('Error verifying recovery code:', err);
    return { valid: false, updatedCodesJson: null, remainingCount: 0 };
  }
}

/**
 * Counts unused recovery codes from JSON
 */
export function countUnusedRecoveryCodes(storedCodesJson: string | null): number {
  if (!storedCodesJson) return 0;
  try {
    const codes: StoredRecoveryCode[] = JSON.parse(storedCodesJson);
    return Array.isArray(codes) ? codes.filter((c) => !c.used).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Signs a pending MFA session token with HMAC SHA-256 (expires in 5 minutes)
 */
export function signPendingMfaToken(payload: Omit<PendingMfaPayload, 'exp'>): string {
  const fullPayload: PendingMfaPayload = {
    ...payload,
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', MFA_SECRET_KEY).update(payloadStr).digest('base64url');

  return `${payloadStr}.${hmac}`;
}

/**
 * Verifies and decodes a pending MFA session token
 */
export function verifyPendingMfaToken(tokenStr: string | undefined | null): PendingMfaPayload | null {
  if (!tokenStr) return null;

  const parts = tokenStr.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', MFA_SECRET_KEY).update(payloadStr).digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload: PendingMfaPayload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
