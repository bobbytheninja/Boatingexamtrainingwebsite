import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RegionContextType {
  region: string;
  setRegion: (region: string) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<string>(() => {
    // Get region from localStorage or default to Bulgaria
    const saved = localStorage.getItem('yacht-exam-region');
    return saved || 'Bulgaria';
  });

  // Save to localStorage whenever region changes
  useEffect(() => {
    localStorage.setItem('yacht-exam-region', region);
  }, [region]);

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
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
