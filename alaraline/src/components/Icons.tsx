// Line icons in the style of the live header (Phosphor-like, 1.4 stroke)
const base = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const SearchIcon = () => (
  <svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
);
export const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20Z" /></svg>
);
export const BagIcon = () => (
  <svg {...base}><path d="M3.5 7h17l-1.3 12.2a1 1 0 0 1-1 .8H5.8a1 1 0 0 1-1-.8L3.5 7Z" /><path d="M8.5 11a3.5 3.5 0 0 0 7 0" /><path d="M8 7V6a4 4 0 0 1 8 0v1" /></svg>
);
export const EyeIcon = () => (
  <svg {...base} width={20} height={20}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Caret = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true"><path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
);
export const Arrow = () => <span aria-hidden="true" className="arrow">→</span>;
