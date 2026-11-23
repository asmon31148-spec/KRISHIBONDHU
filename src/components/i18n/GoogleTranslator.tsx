'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function GoogleTranslator() {
  useEffect(() => {
    window.googleTranslateElementInit = function () {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,bn,hi',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
      <style jsx global>{`
        /* Hide Google Translate top banner, attribution and tooltips to keep clean farmer UI */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        #goog-gt-tt,
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .skiptranslate:not(.goog-te-combo) {
          display: none !important;
        }
      `}</style>
      <Script
        id="google-translate-script"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
