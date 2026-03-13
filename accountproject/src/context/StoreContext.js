// src/context/StoreContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../data/Store.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
