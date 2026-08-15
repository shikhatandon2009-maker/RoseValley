'use client';

import { useEffect } from 'react';
import { useSiteSettingsStore } from '@/store/site-settings-store';

export function SiteSettingsInitializer() {
  const fetchSettings = useSiteSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return null;
}
