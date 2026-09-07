'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { X, Camera, SwitchCamera, AlertCircle, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
  subtitle?: string;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  title = 'Pemindai Barcode Buku',
  subtitle = 'Arahkan kamera ke barcode fisik buku pada eksemplar',
}: BarcodeScannerModalProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isFileScanning, setIsFileScanning] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isOperatingRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  // Keep callback refs updated
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  // Audio feedback on scan
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Ignore if AudioContext is blocked
    }
  };

  const stopScannerInternal = async () => {
    if (!html5QrcodeRef.current) return;
    if (isOperatingRef.current) return;

    isOperatingRef.current = true;
    try {
      // Check if scanner is currently scanning (state 2 = SCANNING)
      const state = html5QrcodeRef.current.getState();
      if (state === 2) {
        await html5QrcodeRef.current.stop();
      }
      html5QrcodeRef.current.clear();
    } catch (err) {
      console.warn('Warning during scanner stop:', err);
    } finally {
      html5QrcodeRef.current = null;
      isOperatingRef.current = false;
      setIsScanning(false);
    }
  };

  const handleSuccessfulScan = (decodedText: string) => {
    const clean = decodedText.trim();
    if (!clean) return;

    playBeep();
    setLastScanned(clean);

    stopScannerInternal().then(() => {
      setTimeout(() => {
        onScanRef.current(clean);
        onCloseRef.current();
      }, 350);
    });
  };

  const startScannerInternal = async (targetCameraId?: string) => {
    setErrorMessage(null);
    setLastScanned(null);

    // Verify browser supports mediaDevices
    if (typeof window !== 'undefined' && (!navigator?.mediaDevices || !navigator?.mediaDevices?.getUserMedia)) {
      setErrorMessage(
        'Kamera tidak didukung pada browser ini atau koneksi tidak aman (HTTPS/localhost diperlukan).'
      );
      return;
    }

    try {
      // Stop previous instance if existing
      await stopScannerInternal();

      const viewportId = 'barcode-scanner-viewport';
      const viewportEl = document.getElementById(viewportId);
      if (!viewportEl) return;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5Qrcode = new Html5Qrcode(viewportId, {
        formatsToSupport,
        verbose: false,
      });
      html5QrcodeRef.current = html5Qrcode;

      // Determine camera configuration
      // Use exact deviceId if provided, or { facingMode: { ideal: "environment" } } to prevent OverconstrainedError on desktop webcams
      let cameraConfig: any;
      if (targetCameraId) {
        cameraConfig = { deviceId: { exact: targetCameraId } };
      } else if (selectedCameraId) {
        cameraConfig = { deviceId: { exact: selectedCameraId } };
      } else {
        cameraConfig = { facingMode: 'environment' };
      }

      await html5Qrcode.start(
        cameraConfig,
        {
          fps: 12,
          // Dynamic qrbox calculation prevents "qrbox size must be smaller than frame" error
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const w = Math.floor(Math.min(viewfinderWidth * 0.85, 300));
            const h = Math.floor(Math.min(viewfinderHeight * 0.6, 170));
            return { width: Math.max(160, w), height: Math.max(90, h) };
          },
          aspectRatio: 1.3333,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Parse frame (ignore idle frames)
        }
      );

      setIsScanning(true);

      // Refresh camera devices list once permissions are granted
      try {
        const devs = await Html5Qrcode.getCameras();
        if (devs && devs.length > 0) {
          setCameras(devs);
        }
      } catch {
        // Ignore if enumeration fails
      }
    } catch (err: any) {
      console.error('Camera startup error:', err);

      // If { facingMode: 'environment' } failed because device only has a front camera, fallback to simple true
      if (!targetCameraId && err?.name === 'OverconstrainedError') {
        try {
          const html5Qrcode = html5QrcodeRef.current || new Html5Qrcode('barcode-scanner-viewport');
          html5QrcodeRef.current = html5Qrcode;
          await html5Qrcode.start(
            { facingMode: 'user' },
            { fps: 12, aspectRatio: 1.3333 },
            (decodedText) => handleSuccessfulScan(decodedText),
            () => {}
          );
          setIsScanning(true);
          return;
        } catch (fallbackErr) {
          console.error('Fallback camera startup error:', fallbackErr);
        }
      }

      let msg = 'Gagal mengakses kamera.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.message?.includes('Permission')) {
        msg = 'Izin akses kamera ditolak. Silakan aktifkan izin kamera pada browser Anda.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError' || err?.message?.includes('No camera')) {
        msg = 'Perangkat kamera tidak ditemukan pada komputer/laptop ini.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain (misal Zoom, Meet). Silakan tutup aplikasi tersebut lalu coba lagi.';
      } else if (err?.name === 'OverconstrainedError') {
        msg = 'Kamera yang diminta tidak memenuhi spesifikasi teknis browser.';
      } else if (err?.message) {
        msg = `Kesalahan: ${err.message}`;
      }
      setErrorMessage(msg);
      setIsScanning(false);
    }
  };

  // Image file scan fallback
  const handleImageFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileScanning(true);
    setErrorMessage(null);

    try {
      // Temporarily stop camera if running
      await stopScannerInternal();

      const html5Qrcode = new Html5Qrcode('barcode-scanner-viewport', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      const decodedResult = await html5Qrcode.scanFile(file, false);
      html5Qrcode.clear();
      if (decodedResult) {
        handleSuccessfulScan(decodedResult);
      } else {
        setErrorMessage('Tidak ada barcode yang terdeteksi pada gambar ini.');
      }
    } catch {
      setErrorMessage('Barcode tidak terdeteksi pada foto/file gambar yang dipilih.');
    } finally {
      setIsFileScanning(false);
      e.target.value = '';
    }
  };

  // Effect: triggered strictly on modal open/close
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    // Small timeout ensures the DOM element has mounted
    const timer = setTimeout(() => {
      if (isCancelled) return;

      Html5Qrcode.getCameras()
        .then((devices) => {
          if (isCancelled) return;
          if (devices && devices.length > 0) {
            setCameras(devices);
            const backCam = devices.find((d) =>
              /back|rear|environment|belakang/i.test(d.label)
            );
            const initialId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(initialId);
            startScannerInternal(initialId);
          } else {
            startScannerInternal();
          }
        })
        .catch(() => {
          if (!isCancelled) {
            startScannerInternal();
          }
        });
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      stopScannerInternal();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleSuccessfulScan(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScannerInternal().then(() => onClose());
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
            {/* Target Viewport for Html5Qrcode */}
            <div id="barcode-scanner-viewport" className="w-full h-full object-cover" />

            {/* Custom Overlay Scanner Box & Laser Guide */}
            {isScanning && !lastScanned && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-36 border-2 border-indigo-400/80 rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                  {/* Target Corners */}
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br" />

                  {/* Animated Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-bounce duration-1000" />
                </div>
              </div>
            )}

            {/* Success Animation Overlay */}
            {lastScanned && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/50">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
                  Barcode Terdeteksi!
                </p>
                <p className="text-base font-mono font-black bg-emerald-900/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {lastScanned}
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {errorMessage && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                <p className="text-xs font-medium text-slate-200 mb-4">{errorMessage}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startScannerInternal(selectedCameraId)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Akses Lagi
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Foto Barcode
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileScan}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Camera Switcher & Controls */}
          <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isScanning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isScanning ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <span>{isScanning ? 'Kamera aktif' : isFileScanning ? 'Memproses gambar...' : 'Siap memindai'}</span>
            </div>

            <div className="flex items-center gap-2">
              <label
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                title="Pindai barcode dari file gambar/foto"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileScan}
                  className="hidden"
                />
              </label>

              {cameras.length > 1 && (
                <div className="flex items-center gap-1.5 ml-2">
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedCameraId(newId);
                      startScannerInternal(newId);
                    }}
                    className="bg-transparent text-xs font-medium outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {cameras.map((c, idx) => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900">
                        {c.label || `Kamera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Fallback Manual Barcode Input */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Atau Ketik Kode Manual / Gunakan Barcode Scanner Fisik:
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: B000101..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-40"
              >
                Gunakan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
