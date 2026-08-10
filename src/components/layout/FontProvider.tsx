'use client';

import React, { useEffect, useState } from 'react';

// Google font helper dictionary mapping font display names to Google Font URL query params
export const GOOGLE_FONTS_MAP: Record<string, { fontParam: string; family: string }> = {
  // Serif / Display
  'Playfair Display': { fontParam: 'Playfair+Display:ital,wght@0,400..900;1,400..900', family: "'Playfair Display', Georgia, serif" },
  'Cormorant Garamond': { fontParam: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400', family: "'Cormorant Garamond', Garamond, serif" },
  'Bodoni Moda': { fontParam: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900', family: "'Bodoni Moda', serif" },
  'Cinzel Decorative': { fontParam: 'Cinzel+Decorative:wght@400;700;900', family: "'Cinzel Decorative', serif" },
  'Cinzel': { fontParam: 'Cinzel:wght@400;600;700;900', family: "'Cinzel', Trajan, serif" },
  'Italiana': { fontParam: 'Italiana', family: "'Italiana', serif" },
  'Prata': { fontParam: 'Prata', family: "'Prata', serif" },
  'Aboreto': { fontParam: 'Aboreto', family: "'Aboreto', cursive" },
  'Marcellus': { fontParam: 'Marcellus', family: "'Marcellus', serif" },
  'Bellefair': { fontParam: 'Bellefair', family: "'Bellefair', serif" },
  'Castoro Titling': { fontParam: 'Castoro+Titling', family: "'Castoro Titling', serif" },

  // Script / Calligraphy
  'Pinyon Script': { fontParam: 'Pinyon+Script', family: "'Pinyon Script', cursive" },
  'Alex Brush': { fontParam: 'Alex+Brush', family: "'Alex Brush', cursive" },
  'Great Vibes': { fontParam: 'Great+Vibes', family: "'Great Vibes', cursive" },
  'Allura': { fontParam: 'Allura', family: "'Allura', cursive" },

  // Sans / UI
  'Plus Jakarta Sans': { fontParam: 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800', family: "'Plus Jakarta Sans', sans-serif" },
  'Tenor Sans': { fontParam: 'Tenor+Sans', family: "'Tenor Sans', sans-serif" },
  'Outfit': { fontParam: 'Outfit:wght@300;400;500;600;700;800', family: "'Outfit', sans-serif" },
  'Syne': { fontParam: 'Syne:wght@400;600;700;800', family: "'Syne', sans-serif" },
  'Montserrat': { fontParam: 'Montserrat:wght@300;400;500;600;700;800', family: "'Montserrat', sans-serif" },
};

export function loadAndApplyGoogleFont(fontName: string, targetType: 'header' | 'body' | 'script') {
  if (!fontName) return;

  const fontInfo = GOOGLE_FONTS_MAP[fontName] || {
    fontParam: fontName.replace(/\s+/g, '+'),
    family: `'${fontName}', serif`,
  };

  // 1. Inject link to Google Fonts stylesheet if not present
  const linkId = `google-font-api-${fontName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontInfo.fontParam}&display=swap`;
    document.head.appendChild(link);
  }

  // 2. Set style overrides
  let styleTag = document.getElementById(`dynamic-font-override-${targetType}`) as HTMLStyleElement;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = `dynamic-font-override-${targetType}`;
    document.head.appendChild(styleTag);
  }

  if (targetType === 'header') {
    document.documentElement.style.setProperty('--font-serif', fontInfo.family);
    document.documentElement.style.setProperty('--font-cormorant', fontInfo.family);
    styleTag.innerHTML = `
      h1, h2, h3, h4, h5, h6,
      .font-serif,
      .luxury-brand-title,
      .luxury-hero-title,
      .product-title,
      .collection-title {
        font-family: ${fontInfo.family} !important;
      }
    `;
  } else if (targetType === 'body') {
    document.documentElement.style.setProperty('--font-jakarta', fontInfo.family);
    styleTag.innerHTML = `
      body, p, span, a, button, input, select,
      .font-sans {
        font-family: ${fontInfo.family} !important;
      }
    `;
  } else if (targetType === 'script') {
    document.documentElement.style.setProperty('--font-script', fontInfo.family);
    styleTag.innerHTML = `
      .font-script,
      .signature-script,
      .provenance-seal-script {
        font-family: ${fontInfo.family} !important;
      }
    `;
  }
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Read from API or fallback localStorage
    let headerFont = 'Playfair Display';
    let bodyFont = 'Plus Jakarta Sans';
    let scriptFont = 'Pinyon Script';

    try {
      const localHeader = localStorage.getItem('admin_header_font');
      const localBody = localStorage.getItem('admin_body_font');
      const localScript = localStorage.getItem('admin_script_font');
      if (localHeader) headerFont = localHeader;
      if (localBody) bodyFont = localBody;
      if (localScript) scriptFont = localScript;
    } catch (e) {
      // Ignore
    }

    // Apply immediate local settings to prevent layout flash
    loadAndApplyGoogleFont(headerFont, 'header');
    loadAndApplyGoogleFont(bodyFont, 'body');
    loadAndApplyGoogleFont(scriptFont, 'script');

    // Sync from server API
    fetch('/api/admin/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data.header_font) {
          loadAndApplyGoogleFont(data.header_font, 'header');
          try { localStorage.setItem('admin_header_font', data.header_font); } catch (e) {}
        }
        if (data.body_font) {
          loadAndApplyGoogleFont(data.body_font, 'body');
          try { localStorage.setItem('admin_body_font', data.body_font); } catch (e) {}
        }
        if (data.script_font) {
          loadAndApplyGoogleFont(data.script_font, 'script');
          try { localStorage.setItem('admin_script_font', data.script_font); } catch (e) {}
        }
      })
      .catch((err) => console.error('Error fetching admin font settings:', err))
      .finally(() => setLoaded(true));
  }, []);

  return <>{children}</>;
}
