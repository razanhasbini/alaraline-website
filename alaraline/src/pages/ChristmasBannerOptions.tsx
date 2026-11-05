import { lazy, Suspense, useEffect, useState } from 'react';
import Home from './Home';
import { BannerLightHive, BannerTurningTree, BannerTwelveDays } from '../components/xmas/ChristmasBannersMore';
import { BannerHive, BannerIssue, BannerMerry, BannerSanta, BannerTorn } from '../components/xmas/ChristmasBanners';

// The homepage with each Christmas banner option as its hero. The switcher sits under the banner, never over it,
// and the left and right arrow keys work too; ?b= keeps the choice.
const ChristmasBoxHero = lazy(() => import('../components/xmas/ChristmasBoxHero'));

const OPTIONS = [
  { id: 'issue', name: 'The Christmas Issue', el: <BannerIssue /> },
  { id: 'merry', name: 'Happy Holidays', el: <BannerMerry /> },
  { id: 'hive', name: 'The Advent Hive', el: <BannerHive /> },
  { id: 'tree', name: 'The Turning Tree', el: <BannerTurningTree /> },
  { id: 'light', name: 'Light Up the Hive', el: <BannerLightHive /> },
  { id: 'days', name: 'The 12 Days', el: <BannerTwelveDays /> },
  { id: 'santa', name: 'Dear Santa', el: <BannerSanta /> },
  { id: 'torn', name: 'Torn & Pinned', el: <BannerTorn /> },
  { id: 'burgundy', name: 'Burgundy box', el: <Suspense fallback={<div className="xh" />}><ChristmasBoxHero /></Suspense> },
];

export default function ChristmasBannerOptions() {
  const [id, setId] = useState(() => {
    const b = new URLSearchParams(location.search).get('b');
    return OPTIONS.some(o => o.id === b) ? b! : OPTIONS[0].id;
  });
  const pick = (next: string) => {
    setId(next);
    history.replaceState(null, '', `?b=${next}`);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const n = OPTIONS.findIndex(o => o.id === id) + (e.key === 'ArrowRight' ? 1 : -1);
      pick(OPTIONS[(n + OPTIONS.length) % OPTIONS.length].id);
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [id]);
  const hero = OPTIONS.find(o => o.id === id)!.el;
  return (
    <Home
      key={id}
      hero={(
        <>
          {hero}
          <nav className="bn-switch" aria-label="Banner options">
            {OPTIONS.map(o => <button key={o.id} type="button" aria-pressed={o.id === id} onClick={() => pick(o.id)}>{o.name}</button>)}
          </nav>
        </>
      )}
    />
  );
}
