import React from 'react';
import { ChapterTurn, GenreDefinition } from '../types/adventure';
import { GitBranch, X, RotateCcw, MapPin, Heart, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface MultiverseMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChapterTurn[];
  currentChapterNumber: number;
  genreDef: GenreDefinition;
  onRewindToChapter: (chapterNumber: number) => void;
}

export const MultiverseMapModal: React.FC<MultiverseMapModalProps> = ({
  isOpen,
  onClose,
  history,
  currentChapterNumber,
  genreDef,
  onRewindToChapter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                Mapa de Ramificaciones del Multiverso
              </h3>
              <p className="text-xs text-zinc-400">
                Visualiza el hilo causal de tus decisiones o viaja a una encrucijada temporal anterior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gradient-to-b from-zinc-950 to-zinc-900">
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-zinc-700">
            {history.map((turn, index) => {
              const isCurrent = turn.chapterNumber === currentChapterNumber;
              const hasNext = index < history.length - 1;

              return (
                <div key={turn.id} className="relative group">
                  {/* Branch node dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold transition-all shadow-md ${
                      isCurrent
                        ? 'bg-purple-600 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110'
                        : 'bg-zinc-900 border-zinc-600 text-zinc-300 group-hover:border-purple-400'
                    }`}
                  >
                    {turn.chapterNumber}
                  </div>

                  {/* Card */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-purple-500/60 bg-purple-950/20 shadow-xl'
                        : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-400">
                          Rama {turn.timelineBranchId || `T-${turn.chapterNumber}`}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-zinc-100">
                          Capítulo {turn.chapterNumber}: {turn.chapterTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="flex items-center gap-1 text-rose-300">
                          <Heart className="w-3 h-3 fill-rose-500/20 text-rose-400" />
                          {turn.playerHealth}%
                        </span>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                            Línea Activa
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              audioEngine.playSelectSound();
                              onRewindToChapter(turn.chapterNumber);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-purple-900/50 hover:border-purple-700/60 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Rebobinar la realidad y explorar otras opciones en este capítulo"
                          >
                            <RotateCcw className="w-3 h-3 text-purple-400" />
                            <span>Viajar Aquí</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Node details */}
                    <div className="pt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-zinc-300 font-medium">{turn.location}</span>
                      </div>

                      {turn.actionTaken && (
                        <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] flex items-center gap-2">
                          <span className="text-purple-400 font-bold">Elección Tomada:</span>
                          <span className="truncate">"{turn.actionTaken}"</span>
                        </div>
                      )}

                      <p className="text-zinc-400 font-serif italic text-xs line-clamp-2">
                        {turn.narrativeParagraphs[0]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>El multiverso guarda automáticamente el registro de cada decisión.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cerrar Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
