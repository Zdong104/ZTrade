// AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isChinese, setIsChinese] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <AppContext.Provider value={{ isChinese, setIsChinese, isDarkMode, setIsDarkMode }}>
      {children}
    </AppContext.Provider>
  );
};
