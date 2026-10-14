import {
  siClaude,
  siDocker,
  siDuckdb,
  siExpress,
  siFastapi,
  siFramer,
  siGit,
  siGooglegemini,
  siHono,
  siJavascript,
  siModelcontextprotocol,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siPandas,
  siPostgresql,
  siPytest,
  siPython,
  siReact,
  siSqlite,
  siSupabase,
  siSwagger,
  siTailwindcss,
  siTypescript,
  siVite,
} from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

/**
 * Stack element id -> brand mark. Deliberately partial: Simple Icons has no
 * Oracle or OpenAI set (both were pulled over trademark claims), and the
 * enterprise and conceptual entries — Fast Formula, HCM Data Loader, RAG,
 * Evals — have no mark to begin with. Anything absent here falls back to the
 * element's own monogram, which is the periodic-table conceit anyway.
 */
const MARKS: Record<string, SimpleIcon> = {
  python: siPython,
  typescript: siTypescript,
  javascript: siJavascript,
  react: siReact,
  nextjs: siNextdotjs,
  tailwind: siTailwindcss,
  'framer-motion': siFramer,
  vite: siVite,
  fastapi: siFastapi,
  nodejs: siNodedotjs,
  express: siExpress,
  hono: siHono,
  rest: siSwagger,
  postgres: siPostgresql,
  pgvector: siPostgresql,
  supabase: siSupabase,
  sqlite: siSqlite,
  duckdb: siDuckdb,
  pandas: siPandas,
  gemini: siGooglegemini,
  claude: siClaude,
  mcp: siModelcontextprotocol,
  git: siGit,
  docker: siDocker,
  pytest: siPytest,
  n8n: siN8n,
};

/** WCAG relative luminance, so brand yellows don't vanish into the paper. */
function luminance(hex: string) {
  const value = parseInt(hex, 16);
  const channel = (raw: number) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255)
  );
}

/**
 * The hovered element's logo. Renders nothing when there is no mark for the id,
 * letting the caller fall through to the monogram.
 */
export function BrandMark({ id, size = 30 }: { id: string; size?: number }) {
  const mark = MARKS[id];
  if (!mark) return null;

  return (
    <svg
      role="img"
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      // Brand colour unless it would wash out against the cream paper.
      fill={luminance(mark.hex) > 0.55 ? 'currentColor' : `#${mark.hex}`}
    >
      <path d={mark.path} />
    </svg>
  );
}
