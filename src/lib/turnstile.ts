/**
 * Cloudflare Turnstile Server-side Verification Helper
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ERROR_MESSAGES: Record<string, string> = {
  'missing-input-secret': 'Kunci rahasia Turnstile belum diatur.',
  'invalid-input-secret': 'Kunci rahasia Turnstile tidak valid.',
  'missing-input-response': 'Verifikasi keamanan Turnstile wajib diselesaikan.',
  'invalid-input-response': 'Token keamanan Turnstile tidak valid atau sudah kedaluwarsa.',
  'bad-request': 'Permintaan verifikasi Turnstile tidak valid.',
  'timeout-or-duplicate': 'Token verifikasi telah kedaluwarsa atau sudah digunakan. Silakan coba lagi.',
  'internal-error': 'Terjadi kendala pada server Cloudflare Turnstile.',
};

/**
 * Memverifikasi token respons Cloudflare Turnstile ke endpoint resmi Cloudflare.
 * 
 * @param token - Token yang dihasilkan oleh widget Turnstile di sisi klien (cf-turnstile-response)
 * @param remoteIp - (Opsional) Alamat IP pengguna untuk verifikasi tambahan
 */
export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Jika kunci rahasia tidak disetel
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY tidak terkonfigurasi di lingkungan produksi.');
      return {
        success: false,
        error: 'Sistem keamanan belum terkonfigurasi dengan benar.',
      };
    }

    console.warn(
      '[Turnstile] TURNSTILE_SECRET_KEY belum disetel. Melewati verifikasi pada mode development.'
    );
    return { success: true };
  }

  // Jika token tidak disertakan dari formulir
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      error: 'Harap selesaikan verifikasi keamanan (Cloudflare Turnstile).',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey.trim());
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      console.error(`[Turnstile] HTTP error ${res.status}:`, await res.text());
      return {
        success: false,
        error: 'Gagal terhubung ke layanan verifikasi keamanan.',
      };
    }

    const data: TurnstileVerifyResponse = await res.json();

    if (data.success) {
      return { success: true };
    }

    const errorCodes = data['error-codes'] || [];
    const firstKnownError = errorCodes.map((code) => ERROR_MESSAGES[code]).find(Boolean);

    return {
      success: false,
      error:
        firstKnownError ||
        (errorCodes.length > 0
          ? `Verifikasi keamanan gagal: ${errorCodes.join(', ')}`
          : 'Verifikasi keamanan gagal. Silakan coba kembali.'),
    };
  } catch (err) {
    console.error('[Turnstile] Verification exception:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memverifikasi keamanan.',
    };
  }
}
