'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import react-barcode with ssr: false to prevent SSR hydration mismatch
const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  format?:
    | 'CODE39'
    | 'CODE128'
    | 'CODE128A'
    | 'CODE128B'
    | 'CODE128C'
    | 'EAN13'
    | 'EAN8'
    | 'UPC'
    | 'ITF14';
  displayValue?: boolean;
  background?: string;
  lineColor?: string;
  className?: string;
  title?: string;
  callNumber?: string;
  showLabelCard?: boolean;
}

export default function BarcodeDisplay({
  value,
  width = 1.4,
  height = 42,
  fontSize = 11,
  format = 'CODE128',
  displayValue = true,
  background = 'transparent',
  lineColor = '#0f172a',
  className = '',
  title,
  callNumber,
  showLabelCard = false,
}: BarcodeDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!value || !value.trim()) {
    return (
      <div className="text-xs text-slate-400 italic py-2">
        Kode barcode belum diisi
      </div>
    );
  }

  // Placeholder while mounting client-side
  if (!isMounted) {
    return (
      <div className="h-14 w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse text-xs text-slate-400">
        Memuat barcode...
      </div>
    );
  }

  if (showLabelCard) {
    return (
      <div
        className={`bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-slate-900 flex flex-col items-center select-none print:border-black print:p-2 print:shadow-none ${className}`}
      >
        <div className="w-full text-center border-b border-dashed border-slate-200 pb-1 mb-1.5 print:border-black">
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700 print:text-black">
            Perpustakaan Digital
          </p>
          {title && (
            <p className="text-xs font-bold text-slate-800 line-clamp-1 print:text-black">
              {title}
            </p>
          )}
          {callNumber && (
            <p className="text-[10px] font-mono text-slate-500 print:text-black">
              {callNumber}
            </p>
          )}
        </div>

        <div className="flex justify-center items-center overflow-x-auto w-full py-1">
          <Barcode
            value={value}
            width={width}
            height={height}
            fontSize={fontSize}
            format={format}
            displayValue={displayValue}
            background={background}
            lineColor={lineColor}
            margin={4}
          />
        </div>

        <div className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest print:text-black">
          Property of Library
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <Barcode
        value={value}
        width={width}
        height={height}
        fontSize={fontSize}
        format={format}
        displayValue={displayValue}
        background={background}
        lineColor={lineColor}
        margin={2}
      />
    </div>
  );
}
