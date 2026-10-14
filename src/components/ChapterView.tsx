import React, { useState, useEffect, useRef } from 'react';
import { ChapterTurn, ChapterOption, GenreDefinition } from '../types/adventure';
import {
  MapPin,
  Backpack,
  Target,
  Sparkles,
  Dices,
  Send,
  Eye,
  EyeOff,
  Volume2,
  Copy,
  Check,
  Heart,
  GitCommit,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { speechReader } from '../utils/speechReader';
import confetti from 'canvas-confetti';

interface ChapterViewProps {
  currentTurn: ChapterTurn;
  genreDef: GenreDefinition;
  onSelectOption: (option: ChapterOption) => void;
  onSubmitCustomAction: (customAction: string, fateRoll?: { d20: number; description: string }) => void;
  isLoading: boolean;
  historyLength: number;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  currentTurn,
  genreDef,
  onSelectOption,
  onSubmitCustomAction,
  isLoading,
  historyLength,
}) => {
  const [customActionText, setCustomActionText] = useState('');
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [rollingDice, setRollingDice] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState<{ d20: number; desc: string } | null>(null);
  const [displayedParagraphs, setDisplayedParagraphs] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter or instant paragraph reveal on turn change
  useEffect(() => {
    // Scroll smoothly to top of chapter
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Sound chime on new chapter
    audioEngine.playChapterAdvance();

    // Trigger celebration confetti on chapter 5, 10, etc.
    if (currentTurn.chapterNumber > 1 && currentTurn.chapterNumber % 5 === 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Initialize paragraphs
    setDisplayedParagraphs(currentTurn.narrativeParagraphs);
    setLastDiceResult(currentTurn.fateRoll ? { d20: currentTurn.fateRoll.d20, desc: currentTurn.fateRoll.description } : null);
  }, [currentTurn.id, currentTurn.chapterNumber]);

  // Keyboard navigation for options 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1' && currentTurn.options[0]) {
        audioEngine.playSelectSound();
        onSelectOption(currentTurn.options[0]);
      } else if (e.key === '2' && currentTurn.options[1]) {
        audioEngine.playSelectSound();
        onSelectOption(currentTurn.options[1]);
      } else if (e.key === '3' && currentTurn.options[2]) {
        audioEngine.playSelectSound();
        onSelectOption(currentTurn.options[2]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, currentTurn.options, onSelectOption]);

  const handleRollDice = () => {
    audioEngine.playDiceRoll();
    setRollingDice(true);
    let counter = 0;
    const interval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * 20) + 1;
      setLastDiceResult({ d20: tempRoll, desc: 'Tirando dados de destino...' });
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        let desc = 'Resultado Regular';
        if (finalRoll === 1) desc = '¡Pifia Crítica! Giro adverso imprevisto';
        else if (finalRoll <= 5) desc = 'Fallo con complicación';
        else if (finalRoll <= 10) desc = 'Éxito parcial con dilema';
        else if (finalRoll <= 17) desc = 'Éxito favorable';
        else if (finalRoll === 20) desc = '¡Éxito Crítico Legendario!';
        else desc = 'Gran Éxito heroico';

        setLastDiceResult({ d20: finalRoll, desc });
        setRollingDice(false);
        if (finalRoll >= 18) {
          audioEngine.playStinger('success');
        } else if (finalRoll <= 3) {
          audioEngine.playStinger('danger');
        }
      }
    }, 60);
  };

  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim() || isLoading) return;
    audioEngine.playSelectSound();
    onSubmitCustomAction(
      customActionText.trim(),
      lastDiceResult ? { d20: lastDiceResult.d20, description: lastDiceResult.desc } : undefined
    );
    setCustomActionText('');
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(currentTurn.rawMarkdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleReadAloud = () => {
    const textToRead = `Capítulo ${currentTurn.chapterNumber}: ${currentTurn.chapterTitle}. ${currentTurn.narrativeParagraphs.join(' ')}`;
    speechReader.speak(textToRead);
  };

  const getOptionBadgeColor = (idx: number) => {
    if (idx === 0) return 'border-sky-500/40 text-sky-300 bg-sky-950/30';
    if (idx === 1) return 'border-amber-500/40 text-amber-300 bg-amber-950/30';
    return 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30';
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Chapter Top Controls & Raw Format Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400">
            Multiverso :: Rama {currentTurn.timelineBranchId || `T-${currentTurn.chapterNumber}`}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">Capítulo {currentTurn.chapterNumber} de la saga</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadAloud}
            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Escuchar este capítulo con voz en español"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Escuchar</span>
          </button>

          <button
            onClick={() => setShowRawMarkdown(!showRawMarkdown)}
            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Alternar entre vista libro inmersiva y formato Markdown estricto"
          >
            {showRawMarkdown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showRawMarkdown ? 'Vista Libro' : 'Ver Markdown Estricto'}</span>
          </button>
        </div>
      </div>

      {/* RAW MARKDOWN VIEW (Strict Compliance Visualizer) */}
      {showRawMarkdown && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-6 space-y-3 font-mono text-xs text-zinc-300 shadow-2xl relative">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="text-amber-400 font-semibold">Salida Estricta Markdown (Verbatim Prompt Format):</span>
            <button
              onClick={handleCopyRaw}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedRaw ? 'Copiado' : 'Copiar Texto'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto text-zinc-300 font-mono select-all">
            {currentTurn.rawMarkdown}
          </pre>
        </div>
      )}

      {/* INFORMATIVE BOOK / NARRATIVE CANVAS */}
      <div className={`relative rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8 overflow-hidden transition-all duration-300 ${genreDef.accentGlow}`}>
        {/* Subtle watermark / genre icon */}
        <div className="absolute right-4 top-4 text-7xl opacity-5 pointer-events-none select-none">
          {genreDef.icon}
        </div>

        {/* --- HEADER FORMAT --- */}
        {/* ### 📖 [Genre Name] - Chapter [Number]: [Chapter Title] */}
        <div className="space-y-3 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-zinc-400">
            <span>📖 {genreDef.name}</span>
            <span>·</span>
            <span>Capítulo {currentTurn.chapterNumber}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-snug">
            {currentTurn.chapterTitle}
          </h2>

          {/* Action that led here */}
          {currentTurn.actionTaken && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 font-mono">
              <GitCommit className="w-3.5 h-3.5 text-purple-400" />
              <span>Consecuencia de: <strong className="text-zinc-200 font-sans">"{currentTurn.actionTaken}"</strong></span>
            </div>
          )}
        </div>

        {/* --- NARRATIVE PARAGRAPHS (2 to 4 engaging paragraphs) --- */}
        <div className="space-y-5 text-zinc-200 text-base sm:text-lg leading-relaxed font-serif tracking-normal">
          {displayedParagraphs.map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-zinc-100">
              {paragraph}
            </p>
          ))}
        </div>

        {/* --- DIVIDER --- */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800/90" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-400 font-mono">Estado Actual de la Línea Temporal</span>
          </div>
        </div>

        {/* --- CURRENT STATUS / CONTEXT (Strict format) --- */}
        {/* #### 🛠️ Current Status / Context */}
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
              <span>🛠️</span> Current Status / Context
            </h3>
            {/* Player vitality pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/60 text-xs font-mono">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
              <span className="text-zinc-300">Vitalidad:</span>
              <span className="text-rose-300 font-bold">{currentTurn.playerHealth}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Location */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Location (Ubicación):</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-zinc-200">
                {currentTurn.location}
              </p>
            </div>

            {/* Inventory / Status */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 md:col-span-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                <Backpack className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inventory / Status:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentTurn.inventoryAndStatus.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Objective */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Current Objective:</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-emerald-200">
                {currentTurn.currentObjective}
              </p>
            </div>
          </div>
        </div>

        {/* --- DIVIDER --- */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800/90" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-400 font-mono">Bifurcación de Decisiones</span>
          </div>
        </div>

        {/* --- WHAT DO YOU DO NEXT? (Strict format) --- */}
        {/* #### ❓ What do you do next? */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-100 flex items-center gap-2">
              <span>❓</span> What do you do next?
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Please choose one of the following actions (o pulsa la tecla correspondiente):
            </p>
          </div>

          {/* The EXACT THREE OPTIONS */}
          <div className="grid grid-cols-1 gap-3.5">
            {currentTurn.options.map((option, index) => {
              const hotkey = index + 1;
              const badgeStyle = getOptionBadgeColor(index);

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    audioEngine.playSelectSound();
                    onSelectOption(option);
                  }}
                  disabled={isLoading}
                  className="group text-left p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900/90 hover:border-zinc-600/80 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Number key badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-xs text-zinc-200 group-hover:scale-105 group-hover:border-zinc-500 transition-all shadow-sm">
                      {hotkey}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-indigo-400 font-mono font-bold">
                          [Option {hotkey}] 🔹
                        </span>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-zinc-100 group-hover:text-white transition-colors">
                          {option.title}
                        </h4>
                        {option.category && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                            {option.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 group-hover:text-zinc-300 leading-relaxed font-sans">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt instruction footer line */}
          <div className="text-center py-1">
            <p className="text-xs text-zinc-300 italic font-serif">
              *Type 1, 2, or 3 (or describe your own custom action) to proceed.*
            </p>
          </div>

          {/* CUSTOM ACTION & D20 FATE ROLL */}
          <form onSubmit={handleCustomActionSubmit} className="pt-2 space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Acción Libre Personalizada
                </label>

                {/* Fate D20 Roll button */}
                <button
                  type="button"
                  onClick={handleRollDice}
                  disabled={rollingDice || isLoading}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                    lastDiceResult
                      ? 'border-purple-500/50 bg-purple-950/40 text-purple-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500'
                  }`}
                  title="Tirar dado d20 de destino para determinar si tu acción tiene suerte o complicaciones"
                >
                  <Dices className={`w-3.5 h-3.5 ${rollingDice ? 'animate-spin' : 'text-purple-400'}`} />
                  <span>{rollingDice ? 'Tirando d20...' : lastDiceResult ? `d20: [${lastDiceResult.d20}]` : 'Tirar d20'}</span>
                </button>
              </div>

              {lastDiceResult && (
                <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
                  <span className="font-mono font-bold">Tirada de Destino: {lastDiceResult.d20} / 20</span>
                  <span className="text-zinc-300 italic">{lastDiceResult.desc}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  placeholder="Describe tu propia acción (Ej: 'Intento sobornar al guardia con las monedas antiguas...')"
                  disabled={isLoading}
                  className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customActionText.trim() || isLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ejecutar</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* LOADING OVERLAY WHILE WEAVING NEXT CHAPTER */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl animate-pulse">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-zinc-100">
                El Multiverso se Transforma...
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                El Maestro del Juego está calculando las consecuencias de tu decisión, ramificando el destino y generando el siguiente capítulo.
              </p>
            </div>
            <div className="pt-2">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-indeterminate" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
