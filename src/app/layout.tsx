import type { Metadata } from 'next';
import { Inter_Tight, Instrument_Serif, Caveat } from 'next/font/google';
import { portfolioConfig } from '@config';
import './globals.css';

const grotesk = Inter_Tight({
  variable: '--font-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const serifDisplay = Instrument_Serif({
  variable: '--font-serif-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const script = Caveat({
  variable: '--font-script',
  subsets: ['latin'],
  display: 'swap',
});

const { personalInfo, seo } = portfolioConfig;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: seo.title,
  description: seo.description,
  authors: [{ name: personalInfo.fullName, url: personalInfo.socialLinks.linkedin }],
  openGraph: {
    type: 'profile',
    title: seo.title,
    description: seo.description,
    url: seo.siteUrl,
    images: [{ url: personalInfo.avatar.posterUrl, alt: personalInfo.fullName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [personalInfo.avatar.posterUrl],
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: personalInfo.fullName,
  jobTitle: personalInfo.roleTitle,
  description: personalInfo.bioParagraph,
  email: `mailto:${personalInfo.socialLinks.email}`,
  url: seo.siteUrl,
  image: `${seo.siteUrl}${personalInfo.avatar.posterUrl}`,
  address: { '@type': 'PostalAddress', addressLocality: personalInfo.location },
  sameAs: [personalInfo.socialLinks.github, personalInfo.socialLinks.linkedin],
  knowsAbout: portfolioConfig.techStack.map((element) => element.name),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${grotesk.variable} ${serifDisplay.variable} ${script.variable} antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
