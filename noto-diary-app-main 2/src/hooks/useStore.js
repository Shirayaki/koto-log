import { useState, useEffect } from 'react';
import { store } from '../data/store';

export function useStore() {
  const [entries, setEntries] = useState(store.getEntries());
  const [kb, setKB] = useState(store.getKB());
  useEffect(() => {
    return store.subscribe(() => {
      setEntries([...store.getEntries()]);
      setKB([...store.getKB()]);
    });
  }, []);
  return { entries, kb };
}
