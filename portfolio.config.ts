/**
 * portfolio.config.ts — the single source of truth.
 *
 * Every component reads from here. No personal data lives in a component.
 *
 * The parts that change on their own schedule live in `content/*.json` instead
 * of inline: the six list-shaped collections that grow, plus the handful of
 * role strings that move when Kartik's title does. JSON is a format a script —
 * or the GitHub Action behind .github/ISSUE_TEMPLATE — can edit safely without
 * parsing TypeScript. The types below still govern them: the casts are checked
 * on the way in, so a malformed entry fails `tsc` rather than the page.
 *
 * Everything else — prose, identity, one-off settings — stays here, where
 * comments survive.
 */

import roleJson from './content/role.json';
import techStackJson from './content/techStack.json';
import projectsJson from './content/projects.json';
import experienceJson from './content/experience.json';
import educationJson from './content/education.json';
import certificationsJson from './content/certifications.json';
import achievementsJson from './content/achievements.json';

export type StackCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'data'
  | 'ai'
  | 'enterprise'
  | 'devops';

export type Proficiency = 'Expert' | 'Advanced' | 'Intermediate';

export interface StackElement {
  id: string;
  /** 1-2 character periodic symbol. */
  symbol: string;
  name: string;
  category: StackCategory;
  proficiency: Proficiency;
  yearsExperience: number;
  description: string;
  relatedProjectIds: string[];
  /** Position in the periodic silhouette. 1-indexed. */
  row: number;
  col: number;
}

export interface ProjectItem {
  id: string;
  /** Letter-spaced caps line above the title. */
  eyebrow: string;
  title: string;
  shortDescription: string;
  featureHighlights: string[];
  techStackTags: string[];
  /** Big pull-stat shown on the open panel, e.g. "424 tests". */
  statValue?: string;
  statLabel?: string;
  liveDemoUrl?: string;
  githubUrl?: string;
  /** Shown in place of links when a project cannot be published. */
  availabilityNote?: string;
}

export interface ExperienceItem {
  role: string;
  organisation: string;
  client?: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface EducationItem {
  qualification: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  issueYear: string;
}

export interface AchievementItem {
  id: string;
  /** Large figure, e.g. "9.5" or "Zero". */
  value: string;
  /** Rendered immediately after the value, e.g. "/10". */
  valueSuffix?: string;
  title: string;
  kicker: string;
  detail: string;
  iconName: string;
}

export interface NavItem {
  id: string;
  label: string;
}

export interface PortfolioConfig {
  personalInfo: {
    fullName: string;
    firstName: string;
    /** Giant ghosted wordmark behind the hero. */
    wordmark: string;
    roleTitle: string;
    heroSubline: string;
    headline: string;
    bioParagraph: string;
    location: string;
    /** Front face of the lanyard ID card. */
    whatIAm: { title: string; detail: string }[];
    /** Back face of the lanyard ID card. */
    idCard: {
      monogram: string;
      label: string;
      subLabel: string;
      idNumber: string;
      department: string;
      validTill: string;
      lanyardText: string;
    };
    /** The hairline-ruled spec table. */
    outerFacts: { label: string; value: string }[];
    pullQuote: string;
    avatar: {
      /** Background-removed cut-out used as the hero bust. */
      cutoutUrl: string;
      /** Original photo, used for the og:image and the note. */
      posterUrl: string;
      /**
       * Optional looping hero video. The subject is matted onto pure white so
       * the hero can drop the backdrop out with `mix-blend-mode: multiply`
       * instead of shipping an alpha codec. When set, the hero renders the
       * player in place of the still cut-out.
       */
      videoUrl?: string;
      /** First frame of videoUrl, matted the same way. */
      videoPosterUrl?: string;
      /**
       * Optional spoken introduction. Deliberately a separate file rather than
       * an audio track inside videoUrl: the voiceover runs ~12s while the video
       * loops every 7s, so muxing them would cut the line off and restart it
       * mid-sentence. Decoupled, the loop stays seamless and the introduction
       * always plays through exactly once, on demand.
       */
      voiceUrl?: string;
      /** Verbatim transcript of voiceUrl. Required whenever voiceUrl is set. */
      voiceTranscript?: string;
    };
    socialLinks: {
      github: string;
      linkedin: string;
      email: string;
      resumePdfUrl: string;
    };
  };
  navigation: NavItem[];
  techStack: StackElement[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  /** Closing card at the foot of the experience timeline. */
  experienceOutro: { kicker: string; heading: string; body: string };
  achievements: AchievementItem[];
  contact: {
    heading: string;
    /** Italic-serif second half of the closing line. */
    headingEmphasis: string;
    body: string;
    ctaLabel: string;
  };
  seo: {
    siteUrl: string;
    title: string;
    description: string;
  };
}

export const STACK_CATEGORIES: { id: StackCategory; label: string }[] = [
  { id: 'languages', label: 'Languages' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'data', label: 'Data' },
  { id: 'ai', label: 'AI & LLM' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'devops', label: 'DevOps' },
];

export const portfolioConfig: PortfolioConfig = {
  personalInfo: {
    fullName: 'Kartik Sharda',
    firstName: 'Kartik',
    wordmark: 'KARTIK',
    // From content/role.json — the three strings that move when the title does.
    roleTitle: roleJson.roleTitle,
    heroSubline: roleJson.heroSubline,
    headline: roleJson.headline,
    bioParagraph:
      'I build AI products for the back-office problems I spent six years inside: payroll, commissions, reconciliation, vendor file exchange. Enterprise payroll systems engineer for Fortune 500 clients, now Oracle Fusion HCM certified, shipping agentic and LLM applications that non-technical operators run every day.',
    location: 'Noida, India',
    whatIAm: [
      {
        title: 'Payroll systems engineer',
        detail: 'PeopleSoft · SQR · Control-M · Fortune 500',
      },
      { title: 'Oracle Fusion HCM certified', detail: 'Process Essentials · AI Agent Studio' },
      { title: 'Agentic AI builder', detail: 'MCP · RAG · multi-agent orchestration' },
      { title: 'Ships products, not demos', detail: 'NEXUS · EverythinInAI · live users' },
      { title: 'Knows when not to use a model', detail: 'Deterministic rules where money moves' },
    ],
    idCard: {
      monogram: 'KS',
      label: 'Engineer ID',
      subLabel: 'Portfolio · 2026',
      idNumber: 'KS-0717',
      department: 'AI & Automation',
      validTill: '2027',
      lanyardText: 'KARTIK SHARDA',
    },
    outerFacts: [
      { label: 'Based in', value: 'Noida, India' },
      { label: 'Open to', value: 'UAE / GCC relocation' },
      { label: 'Experience', value: '6 years · Fortune 500' },
      { label: 'Certified', value: 'Oracle Fusion Cloud HCM' },
      { label: 'Focus', value: 'Payroll · AI · Automation' },
    ],
    pullQuote: 'From the payroll table to the last prompt.',
    avatar: {
      cutoutUrl: '/avatar/kartik-cutout.png',
      posterUrl: '/avatar/kartik-photo.jpg',
      // The HeyGen/ElevenLabs lip-sync take, matted onto white the same way.
      // Point these back at `/avatar/kartik-hero.mp4` +
      // `/avatar/kartik-hero-poster.png` to return to the Veo bust — both files
      // are still in public/avatar.
      videoUrl: '/avatar/kartik-hero-lipsync.mp4',
      videoPosterUrl: '/avatar/kartik-hero-lipsync-poster.png',
      // The denoised master of the same take — noise floor -90dBFS against the
      // -35dBFS of `kartik-intro-synced.m4a`, which it replaces. Same recording,
      // so the lip-sync survives: it needed only a 15ms head trim to sit at
      // t=0 with the video (measured, not guessed — envelope cross-correlation
      // puts the residual under 5ms, an eighth of a frame).
      //
      // Unlike the file it replaces this one needs no silence pad; it still
      // carries the take's own ~1.8s of lead-in, which is what the pad was
      // reconstructing. Re-measure the offset if either asset is ever re-cut.
      voiceUrl: '/avatar/kartik-intro-clean.m4a',
      voiceTranscript:
        "Hi, I'm Kartik Sharda. I spent six years inside enterprise payroll — pay calculations, vendor file exchange, the systems nobody sees. Now I build the AI and automation products. Oracle Fusion HCM certified.",
    },
    socialLinks: {
      github: 'https://github.com/kssharda0717-dev',
      linkedin: 'https://www.linkedin.com/in/kartik-ssharda',
      email: 'kssharda0717@gmail.com',
      resumePdfUrl: '/Kartik_Sharda_Resume.pdf',
    },
  },

  navigation: [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'work', label: 'Work' },
    { id: 'experience', label: 'Experience' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' },
  ],

  // ── The periodic silhouette ────────────────────────────────────────────
  // 10 columns. The gaps in the grid are deliberate: they make it read as a
  // periodic table rather than a word cloud. A new element has to be given a
  // free row/col by hand — see docs/TASKS.md T-7.
  techStack: techStackJson as StackElement[],

  // ── Work ───────────────────────────────────────────────────────────────
  projects: projectsJson as ProjectItem[],

  // ── Experience ─────────────────────────────────────────────────────────
  experience: experienceJson as ExperienceItem[],
  education: educationJson as EducationItem[],

  // ── Certifications ─────────────────────────────────────────────────────
  certifications: certificationsJson as CertificationItem[],

  experienceOutro: {
    kicker: "What's next",
    heading: 'Your team?',
    body: 'Open to AI, automation and Oracle Fusion HCM roles — including UAE / GCC relocation.',
  },

  // ── Proud moments ──────────────────────────────────────────────────────
  achievements: achievementsJson as AchievementItem[],

  contact: {
    heading: 'Need someone who has',
    headingEmphasis: 'shipped this before?',
    body: 'I am open to AI Solutions Engineer, Forward Deployed Engineer and AI Automation roles — relocating to Dubai or Abu Dhabi. If you have a back-office problem that everyone has given up on, that is the one I want to hear about.',
    ctaLabel: 'Let\u2019s talk',
  },

  seo: {
    // Must match the host's primary domain exactly. Vercel serves `www` as
    // primary and 308s the apex to it, so the apex form here would make every
    // og:url, og:image and the JSON-LD url a redirect. See DECISIONS D-022.
    siteUrl: 'https://www.kartiksharda.in',
    // Kept beside the role strings so a title change updates the share preview
    // in the same edit, instead of leaving the two to drift apart.
    title: roleJson.seoTitle,
    description: roleJson.seoDescription,
  },
};

export default portfolioConfig;
