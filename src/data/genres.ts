import { GenreDefinition, GenreKey } from '../types/adventure';

export const GENRES: Record<GenreKey, GenreDefinition> = {
  mystery: {
    id: 'mystery',
    name: 'Misterio / Cine Negro',
    nameEnglish: 'Mystery / Noir',
    tagline: 'Sombras, lluvia incesante y secretos mortales',
    era: 'Años 40 / Metrópolis en decadencia',
    icon: '🕵️‍♂️',
    description:
      'Sumérgete en callejones empapados de lluvia, humo de tabaco denso, detectives de impermeable raído, policías corruptos y conspiraciones de alta alcurnia donde nadie dice la verdad.',
    keyThemes: ['Crimen organizado', 'Dilemas morales', 'Pistas forenses', 'Traición y sombras'],
    themeColor: 'from-amber-500/20 via-zinc-900 to-black',
    badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    borderColor: 'border-amber-700/40 hover:border-amber-500/70',
    accentGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    sampleOpening: 'La lluvia cae como plomo sobre el cristal esmerilado de tu despacho en el Callejón de las Agujas...',
  },
  scifi: {
    id: 'scifi',
    name: 'Ciencia Ficción / Cyberpunk / Ópera Espacial',
    nameEnglish: 'Sci-Fi / Cyberpunk / Space Opera',
    tagline: 'Neon sintético, IA desbocada y abismos interestelares',
    era: 'Siglo XXIII / Estación Orbital Érebo',
    icon: '🚀',
    description:
      'Despierta entre implantes neuronales sobrecalentados, megacorporaciones despiadadas, naves a la deriva en gravedad cero y anomalías cuánticas que desafían las leyes de la física.',
    keyThemes: ['Inteligencia Artificial', 'Cibernética', 'Hiper-salto', 'Supervivencia en el vacío'],
    themeColor: 'from-cyan-500/20 via-zinc-900 to-black',
    badgeBg: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60',
    borderColor: 'border-cyan-700/40 hover:border-cyan-500/70',
    accentGlow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
    sampleOpening: 'El gas criogénico sisea mientras la cápsula médica 04 se despresuriza en la Estación Órbita-9...',
  },
  fantasy: {
    id: 'fantasy',
    name: 'Alta Fantasía / Fantasía Oscura',
    nameEnglish: 'High Fantasy / Dark Fantasy',
    tagline: 'Magia de sangre, dioses extintos y coronas en ceniza',
    era: 'Era del Eclipse / Tierras Sombrías de Eldoria',
    icon: '⚔️',
    description:
      'Recorre ruinas ancestrales cubiertas de niebla espectral, blande acero frío contra horrores de las profundidades y pacta con entidades olvidadas donde cada hechizo exige un tributo carnal.',
    keyThemes: ['Magia prohibida', 'Reliquias sagradas', 'Monstruos abisales', 'Pactos de sangre'],
    themeColor: 'from-emerald-500/20 via-zinc-900 to-black',
    badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    borderColor: 'border-emerald-700/40 hover:border-emerald-500/70',
    accentGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    sampleOpening: 'La niebla espectral acaricia tus botas desgastadas en el Círculo de Monolitos de Vorath...',
  },
};
