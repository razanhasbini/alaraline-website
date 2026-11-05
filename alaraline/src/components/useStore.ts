import { createContext, useContext } from 'react';

// Bag and wishlist counts shown in the header. The replica has no checkout: products link to alaraline.co.
export type Store = { bag: number; wish: string[]; add: () => void; toggleWish: (slug: string) => void };
export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore needs StoreProvider');
  return s;
}
