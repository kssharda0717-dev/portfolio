import { Hero } from '@/components/Hero';
import { PillNav } from '@/components/PillNav';
import { About } from '@/components/About';
import { TechStack } from '@/components/TechStack';
import { Work } from '@/components/Work';
import { Certifications } from '@/components/Certifications';
import { Experience } from '@/components/Experience';
import { Achievements } from '@/components/Achievements';
import { Contact } from '@/components/Contact';

export default function Home() {
  return (
    <>
      <PillNav />
      <main id="main">
        <Hero />
        <About />
        <TechStack />
        <Work />
        <Certifications />
        <Experience />
        <Achievements />
        <Contact />
      </main>
    </>
  );
}
