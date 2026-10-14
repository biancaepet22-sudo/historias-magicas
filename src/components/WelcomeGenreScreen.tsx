import React, { useState, useEffect } from 'react';
import { GENRES } from '../data/genres';
import { GenreKey } from '../types/adventure';
import { Sparkles, Compass, ShieldAlert, ArrowRight, Dices, Volume2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface WelcomeGenreScreenProps {
  onSelectGenre: (genre: GenreKey, customFlavor?: string) => void;
  isLoading: boolean;
}

export const WelcomeGenreScreen: React.FC<WelcomeGenreScreenProps> = ({
  onSelectGenre,
  isLoading,
}) => {
  const [selectedGenreKey, setSelectedGenreKey] = useState<GenreKey>('mystery');
  const [customFlavor, setCustomFlavor] = useState('');
  const [hoveredPreview, setHoveredPreview] = useState<GenreKey | null>(null);

  // Keyboard shortcut listener: 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      // Don't trigger if typing in text input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') {
        audioEngine.playSelectSound();
        onSelectGenre('mystery');
      } else if (e.key === '2') {
        audioEngine.playSelectSound();
        onSelectGenre('scifi');
      } else if (e.key === '3') {
        audioEngine.playSelectSound();
        onSelectGenre('fantasy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onSelectGenre]);

  const handleStart = (genre: GenreKey) => {
    audioEngine.playSelectSound();
    onSelectGenre(genre, customFlavor.trim() || undefined);
  };

  const handlePreviewSound = (genre: GenreKey) => {
    setHoveredPreview(genre);
    audioEngine.playGenreAmbient(genre);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/25 via-zinc-950 to-black -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Game Master Welcome Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            MOTOR DE FICCIÓN INTERACTIVA Y MAESTRO DEL JUEGO
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-100 leading-tight">
            Bienvenido al <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300">Multiverso</span>
          </h1>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md text-zinc-300 text-sm sm:text-base leading-relaxed text-left sm:text-center space-y-2 shadow-xl">
            <p className="font-serif italic text-zinc-200">
              «Las líneas temporales convergen en este umbral. Cada decisión que tomes abrirá una brecha en la realidad, alterando el destino, forjando alianzas o sellando condenas irrevocables.»
            </p>
            <p className="text-xs text-zinc-400 font-sans">
              Para dar inicio a la crónica y despertar el <strong className="text-zinc-200">Capítulo 1</strong>, selecciona tu género preferido o presiona <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-zinc-200">1</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-zinc-200">2</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-zinc-200">3</kbd>:
            </p>
          </div>
        </div>

        {/* The 3 Genre Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.keys(GENRES) as GenreKey[]).map((key, index) => {
            const def = GENRES[key];
            const isSelected = selectedGenreKey === key;
            const hotkey = index + 1;

            return (
              <div
                key={key}
                onMouseEnter={() => handlePreviewSound(key)}
                onClick={() => setSelectedGenreKey(key)}
                className={`relative group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer backdrop-blur-md overflow-hidden ${
                  isSelected
                    ? `${def.borderColor} bg-gradient-to-b ${def.themeColor} ${def.accentGlow} ring-1 ring-zinc-400/20`
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                {/* Hotkey badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 shadow-sm">
                    Tecla [{hotkey}]
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Icon & Era */}
                  <div className="flex items-center gap-3">
                    <div className="text-4xl p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform">
                      {def.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                        {def.era}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                        {def.name}
                      </h3>
                    </div>
                  </div>

                  {/* Subtitle / Tagline */}
                  <p className="text-xs font-medium text-zinc-300 italic">
                    "{def.tagline}"
                  </p>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {def.description}
                  </p>

                  {/* Key themes */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {def.keyThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950/60 text-zinc-300 border border-zinc-800/80"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>

                  {/* Sample opening snippet */}
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/60 text-[11px] text-zinc-400 font-serif italic line-clamp-2">
                    "{def.sampleOpening}"
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(key);
                    }}
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    <span>Iniciar en {def.name.split('/')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Custom Flavor / Persona Input */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Dices className="w-4 h-4 text-purple-400" />
              ¿Quieres añadir un detalle o matiz personalizado a tu personaje? (Opcional)
            </label>
            <span className="text-[10px] text-zinc-300">Ej: "Soy un ex-mercenario cínico"</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customFlavor}
              onChange={(e) => setCustomFlavor(e.target.value)}
              placeholder="Ej: Detective atormentado con un secreto en el bolsillo, o piloto novato..."
              className="flex-1 bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStart(selectedGenreKey);
                }
              }}
            />
            <button
              onClick={() => handleStart(selectedGenreKey)}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? 'Invocando...' : 'Comenzar'}
            </button>
          </div>
        </div>

        {/* Loading overlay indicator if starting */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 text-center max-w-md mx-auto shadow-2xl animate-pulse space-y-3">
            <div className="inline-block p-3 rounded-full bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="font-serif text-lg font-bold text-zinc-100">
              El Maestro del Juego está tejiendo el Capítulo 1...
            </h4>
            <p className="text-xs text-zinc-400">
              Estableciendo la atmósfera, preparando el inventario y calculando las primeras bifurcaciones de tu destino.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
