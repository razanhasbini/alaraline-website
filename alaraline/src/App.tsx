import { lazy, Suspense } from 'react';
import { StoreProvider } from './components/store';
import Home from './pages/Home';

const PrBox = lazy(() => import('./pages/PrBox'));
const ChristmasBoxHero = lazy(() => import('./components/xmas/ChristmasBoxHero'));
const ChristmasBannerOptions = lazy(() => import('./pages/ChristmasBannerOptions'));

// Routes: the homepage replica at /, the Christmas PR box page at /christmas-pr-box,
// the homepage with the 3D Christmas box as its hero at /christmas-banner,
// and all the Christmas banner options, with a switcher, at /christmas-banners.
// Vite's dev server and `vite preview` both serve index.html for unknown paths, so plain links work.
export default function App() {
  const path = location.pathname.replace(/\/+$/, '');
  return (
    <StoreProvider>
      {path === '/christmas-pr-box'
        ? <Suspense fallback={<div className="prbox-loading" />}><PrBox /></Suspense>
        : path === '/christmas-banners'
        ? <Suspense fallback={null}><ChristmasBannerOptions /></Suspense>
        : path === '/christmas-banner'
          ? <Home hero={<Suspense fallback={<div className="xh" />}><ChristmasBoxHero /></Suspense>} />
          : <Home />}
    </StoreProvider>
  );
}
