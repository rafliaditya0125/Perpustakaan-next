import arcjet, {
  shield,
  detectBot,
  slidingWindow,
  ArcjetNextRequest,
  request as arcjetRequest,
} from '@arcjet/next';

const rawKey = process.env.ARCJET_KEY?.trim();
const isKeyConfigured = Boolean(
  rawKey &&
    !rawKey.includes('your_arcjet_key_here') &&
    rawKey.startsWith('ajkey_')
);

const isProduction = process.env.NODE_ENV === 'production';
// Default to LIVE if key is configured, otherwise DRY_RUN in dev
const defaultMode = isKeyConfigured ? 'LIVE' : 'DRY_RUN';

// Use configured key or dummy fallback for dry-run
const arcjetKey = isKeyConfigured ? rawKey! : 'ajkey_000000000000000000000000000';

/**
 * Arcjet instance untuk halaman umum / Home page.
 * - Shield (WAF untuk melindungi dari SQLi, XSS, Path Traversal)
 * - Bot Detection (Mengizinkan mesin pencari seperti Google/Bing)
 * - Rate Limiting (120 permintaan per 1 menit)
 */
export const httpArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({
      mode: defaultMode,
    }),
    detectBot({
      mode: defaultMode,
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        'CATEGORY:MONITOR',
      ],
    }),
    slidingWindow({
      mode: defaultMode,
      interval: '1m',
      max: 120,
    }),
  ],
});

/**
 * Arcjet instance untuk otentikasi (Login Anggota, Login Petugas, Pendaftaran).
 * - Shield (WAF)
 * - Bot Detection ketat (Semua bot otomatis dilarang pada form login)
 * - Rate Limiting ketat anti brute-force (15 request per 15 menit)
 */
export const authArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({
      mode: defaultMode,
    }),
    detectBot({
      mode: defaultMode,
      allow: [], // Melarang seluruh bot pada endpoint login/auth
    }),
    slidingWindow({
      mode: defaultMode,
      interval: '15m',
      max: 15,
    }),
  ],
});

export interface ArcjetProtectionResult {
  allowed: boolean;
  status: number;
  reason?: 'RATE_LIMIT' | 'BOT' | 'SHIELD' | 'DENIED' | 'ERROR';
  message?: string;
}

/**
 * Helper untuk memproteksi request menggunakan instance Arcjet tertentu.
 */
export async function protectWithArcjet(
  aj: typeof httpArcjet | typeof authArcjet,
  req?: ArcjetNextRequest | Request
): Promise<ArcjetProtectionResult> {
  // Jika di development dan belum ada key Arcjet yang sah, log peringatan & fail-open
  if (!isKeyConfigured) {
    if (isProduction) {
      console.error('[Arcjet] Peringatan: ARCJET_KEY belum disetel di lingkungan produksi!');
    }
    // Fail-open di dev mode jika user belum mendaftar key
    return { allowed: true, status: 200 };
  }

  try {
    const requestDetails = req || (await arcjetRequest());
    const decision = await aj.protect(requestDetails);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          allowed: false,
          status: 429,
          reason: 'RATE_LIMIT',
          message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba kembali.',
        };
      }

      if (decision.reason.isBot()) {
        return {
          allowed: false,
          status: 403,
          reason: 'BOT',
          message: 'Akses ditolak: Permintaan otomatis atau bot terdeteksi.',
        };
      }

      if (decision.reason.isShield()) {
        return {
          allowed: false,
          status: 403,
          reason: 'SHIELD',
          message: 'Akses ditolak oleh sistem keamanan web (WAF) karena pola permintaan mencurigakan.',
        };
      }

      return {
        allowed: false,
        status: 403,
        reason: 'DENIED',
        message: 'Akses ditolak oleh sistem keamanan Arcjet.',
      };
    }

    return { allowed: true, status: 200 };
  } catch (error) {
    console.error('[Arcjet] Error during request evaluation:', error);
    // Arcjet fail-open by design jika terjadi exception
    return { allowed: true, status: 200, reason: 'ERROR' };
  }
}

export { arcjetRequest };
