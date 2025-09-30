'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

export const usePrint = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const pageStyle = `
    @font-face {
      font-family: 'MusGlyphs';
      src: url('/fonts/MusGlyphs.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'New Century Schoolbook';
      src: url('/fonts/NewCenturySchoolbook.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Calendula';
      src: url('/fonts/Calendula.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        margin: 0;
        padding: 0;
        background: white !important;
      }
      
      .print-container {
        margin: 0;
        padding: 0;
      }
      
      .print-page {
        page-break-after: always;
        page-break-inside: avoid;
        margin: 0;
        padding: 0;
        width: 794px !important;
        height: 1123px !important;
        background: white !important;
      }
      
      .print-page:last-child {
        page-break-after: avoid;
      }
      
      svg {
        display: block !important;
        background: white !important;
      }
      
      text {
        fill: black !important;
      }
      
      .time-signature {
        font-family: 'MusGlyphs', serif !important;
      }
      
      .dynamic {
        font-family: 'MusGlyphs', serif !important;
      }
      
      .tuplet {
        font-family: 'MusGlyphs', serif !important;
      }
      
      .notes {
        font-family: 'Calendula', serif !important;
      }
      
      .title {
        font-family: 'New Century Schoolbook', serif !important;
      }
      
      .subtitle {
        font-family: 'New Century Schoolbook', serif !important;
      }
      
      .lyric {
        font-family: 'New Century Schoolbook', serif !important;
      }
      
      .staff-line {
        stroke: black !important;
        stroke-width: 1 !important;
      }
      
      .note {
        fill: black !important;
      }
      
      .barline {
        stroke: black !important;
        stroke-width: 1 !important;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Music Score',
    onBeforePrint: () => {
      console.log('Print ref current:', printRef.current);
      console.log('Print ref children:', printRef.current?.children);
      return Promise.resolve();
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error);
    },
    pageStyle,
  });

  return {
    printRef,
    handlePrint,
  };
}