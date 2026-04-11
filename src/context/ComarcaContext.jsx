import React, { createContext, useContext, useState } from 'react';

const ComarcaContext = createContext();

export const ComarcaProvider = ({ children }) => {
  const [comarca, setComarca] = useState(null);

  return (
    <ComarcaContext.Provider value={{ comarca, setComarca }}>
      {children}
    </ComarcaContext.Provider>
  );
};

export const useComarca = () => {
  const context = useContext(ComarcaContext);
  if (!context) {
    throw new Error('useComarca deve ser usado dentro de ComarcaProvider');
  }
  return context;
};
