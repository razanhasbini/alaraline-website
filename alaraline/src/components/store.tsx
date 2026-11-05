import { useState, type ReactNode } from 'react';
import { StoreContext, type Store } from './useStore';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bag, setBag] = useState(0);
  const [wish, setWish] = useState<string[]>([]);
  const store: Store = {
    bag,
    wish,
    add: () => setBag(n => n + 1),
    toggleWish: slug => setWish(w => (w.includes(slug) ? w.filter(s => s !== slug) : [...w, slug])),
  };
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
