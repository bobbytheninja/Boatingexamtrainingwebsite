import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const REGIONS_URL = 'https://abtrsjhvjfgcxxpkszwi.supabase.co/functions/v1/make-server-d36f8f91/regions';

interface RegionContextType {
  region: string;
  setRegion: (region: string) => void;
  regions: string[];
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<string>(() => {
    const saved = localStorage.getItem('yacht-exam-region');
    return saved || 'Bulgaria';
  });
  const [regions, setRegions] = useState<string[]>(['Bulgaria']);

  useEffect(() => {
    fetch(REGIONS_URL)
      .then((r) => r.json())
      .then((data) => {
        const list: string[] = data.regions || ['Bulgaria'];
        setRegions(list);
        // If the saved region is no longer in the list, reset to the first available
        setRegionState((prev) => (list.includes(prev) ? prev : list[0] || 'Bulgaria'));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('yacht-exam-region', region);
  }, [region]);

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, regions }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
