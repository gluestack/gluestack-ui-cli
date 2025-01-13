'use client';
import React, { createContext, useState, useContext } from 'react';

type ContextType = {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
};

export const ColorContext = createContext<ContextType>({
  colorMode: 'dark',
  toggleColorMode: () => {},
});

export const ColorModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');

  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ColorContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorContext);

  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }

  return context;
};
