import { useEffect, type ReactNode } from 'react';
import '../styles/home.css';
import Snow from '../components/Snow';
import { AnnouncementBar, Header } from '../components/home/Header';
import Hero from '../components/home/Hero';
import { BestSellers, Categories, CategoryTabs, ChristmasBundles, Elevate, Features, Offers } from '../components/home/Sections';
import ResultsWall from '../components/home/ResultsWall';
import CustomerLove from '../components/home/CustomerLove';
import Footer from '../components/home/Footer';

// alaraline.co's homepage, section for section, in the live order. `hero` swaps the first screen (for previews).
export default function Home({ hero }: { hero?: ReactNode }) {
  useEffect(() => { document.title = 'Home - ÀLara Line'; }, []);
  return (
    <div className="home">
      <AnnouncementBar />
      <Header />
      <main>
        {hero ?? <Hero />}
        <BestSellers />
        <ChristmasBundles />
        <Categories />
        <ResultsWall />
        <Elevate />
        <CategoryTabs />
        <Offers />
        <CustomerLove />
        <Features />
      </main>
      <Footer />
      <Snow />
    </div>
  );
}
