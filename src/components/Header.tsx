import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  GitBranch,
  BookOpen,
  Save,
  RotateCcw,
  Sparkles,
  Headphones,
  Sliders,
  Keyboard,
} from 'lucide-react';
import { GenreDefinition } from '../types/adventure';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  currentGenreDef: GenreDefinition | null;
  chapterCount: number;
  onOpenMultiverse: () => void;
  onOpenChronicle: () => void;
  onOpenSaveLoad: () => void;
  onNewGame: () => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
  isNarrationActive: boolean;
  onToggleNarration: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGenreDef,
  chapterCount,
  onOpenMultiverse,
  onOpenChronicle,
  onOpenSaveLoad,
  onNewGame,
  isAudioMuted,
  onToggleMute,
  ambientVolume,
  onChangeAmbientVolume,
  isNarrationActive,
  onToggleNarration,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Genre */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewGame}
            className="flex items-center gap-2 group text-left cursor-pointer transition-transform hover:scale-[1.01]"
            title="Ir al inicio / Nueva Partida"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 border border-zinc-700/60 flex items-center justify-center text-lg shadow-inner group-hover:border-zinc-500 transition-colors">
              🌌
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base sm:text-lg tracking-wide bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Crónicas del Multiverso
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 hidden sm:inline-block">
                  CYOA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Motor de Ficción Ramificada en Tiempo Real
              </p>
            </div>
          </button>

          {currentGenreDef && (
            <div className="hidden md:flex items-center gap-1.5 ml-3 pl-3 border-l border-zinc-800">
              <span className="text-base">{currentGenreDef.icon}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${currentGenreDef.badgeBg}`}>
                {currentGenreDef.name}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                · Cap. {chapterCount}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Controls */}
          <div className="relative">
            <button
              onClick={() => {
                audioEngine.playSelectSound();
                onToggleMute();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowVolumeSlider(!showVolumeSlider);
              }}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isAudioMuted
                  ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-300'
                  : 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
              }`}
              title={isAudioMuted ? 'Activar sonido ambiental' : 'Silenciar sonido ambiental'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden lg:inline">{isAudioMuted ? 'Mute' : 'Ambiente'}</span>
            </button>

            {/* Volume dropdown toggle */}
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-1 text-zinc-300 hover:text-zinc-200 absolute -right-2 -top-1"
              title="Ajustar volumen"
            >
              <Sliders className="w-3 h-3" />
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 mt-2 p-3 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl z-50 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Volumen Ambiente</span>
                  <span className="font-mono">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* TTS Audio Narration */}
          {currentGenreDef && (
            <button
              onClick={() => {
                audioEngine.playSelectSound();
                onToggleNarration();
              }}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isNarrationActive
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 animate-pulse'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-200'
              }`}
              title={isNarrationActive ? 'Pausar narración en voz alta' : 'Escuchar narración (Audiolibro en Español)'}
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden xl:inline">{isNarrationActive ? 'Voz Activa' : 'Narrar'}</span>
            </button>
          )}

          {/* Multiverse Branches Button */}
          {currentGenreDef && (
            <button
              onClick={() => {
                audioEngine.playSelectSound();
                onOpenMultiverse();
              }}
              className="p-2 sm:px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Abrir mapa de ramificaciones del Multiverso (M)"
            >
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Multiverso</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-mono">
                {chapterCount}
              </span>
            </button>
          )}

          {/* Chronicle / Journal Button */}
          {currentGenreDef && (
            <button
              onClick={() => {
                audioEngine.playSelectSound();
                onOpenChronicle();
              }}
              className="p-2 sm:px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Abrir el diario completo de capítulos (C)"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Crónica</span>
            </button>
          )}

          {/* Save / Load */}
          {currentGenreDef && (
            <button
              onClick={() => {
                audioEngine.playSelectSound();
                onOpenSaveLoad();
              }}
              className="p-2 sm:px-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Guardar / Cargar Partida"
            >
              <Save className="w-4 h-4 text-sky-400" />
            </button>
          )}

          {/* Shortcuts tooltip */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:text-zinc-300 transition-colors hidden sm:flex cursor-pointer"
            title="Atajos de teclado"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* New Game */}
          <button
            onClick={() => {
              audioEngine.playSelectSound();
              onNewGame();
            }}
            className="p-2 sm:px-3 rounded-lg border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/30 hover:border-rose-700/50 text-rose-300 transition-all text-xs font-medium flex items-center gap-1 cursor-pointer"
            title="Iniciar nueva aventura en otro género"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-400" /> Atajos de Teclado
            </h3>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span>Elegir Opción 1, 2 o 3</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">1, 2, 3</kbd>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span>Abrir Mapa Multiverso</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">M</kbd>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span>Abrir Crónica / Grimoire</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">C</kbd>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span>Silenciar / Activar Sonido</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">S</kbd>
              </li>
            </ul>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-5 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
