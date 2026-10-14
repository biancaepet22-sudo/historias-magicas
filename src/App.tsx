/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GenreKey, ChapterTurn, ChapterOption } from './types/adventure';
import { GENRES } from './data/genres';
import { Header } from './components/Header';
import { WelcomeGenreScreen } from './components/WelcomeGenreScreen';
import { ChapterView } from './components/ChapterView';
import { MultiverseMapModal } from './components/MultiverseMapModal';
import { ChronicleModal } from './components/ChronicleModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { audioEngine } from './utils/audioEngine';
import { speechReader } from './utils/speechReader';
import { AlertTriangle, Sparkles } from 'lucide-react';

const AUTOSAVE_KEY = 'multiverse_cyoa_autosave';

export default function App() {
  const [selectedGenre, setSelectedGenre] = useState<GenreKey | null>(null);
  const [history, setHistory] = useState<ChapterTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<ChapterTurn | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isMultiverseOpen, setIsMultiverseOpen] = useState(false);
  const [isChronicleOpen, setIsChronicleOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);

  // Audio & Speech state
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [isNarrationActive, setIsNarrationActive] = useState(false);

  // Hook speechReader state listener
  useEffect(() => {
    speechReader.setCallback((speaking) => {
      setIsNarrationActive(speaking);
    });
  }, []);

  // Global key listener for shortcuts (M for map, C for chronicle, S for sound)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when in text fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'm' || e.key === 'M') {
        if (selectedGenre && currentTurn) {
          setIsMultiverseOpen((prev) => !prev);
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (selectedGenre && history.length > 0) {
          setIsChronicleOpen((prev) => !prev);
        }
      } else if (e.key === 's' || e.key === 'S') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedGenre, currentTurn, history.length]);

  // Load auto-save on initial mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.genre && parsed.history && parsed.history.length > 0) {
          setSelectedGenre(parsed.genre);
          setHistory(parsed.history);
          setCurrentTurn(parsed.history[parsed.history.length - 1]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-save whenever history updates
  useEffect(() => {
    if (selectedGenre && history.length > 0) {
      try {
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({
            genre: selectedGenre,
            history,
          })
        );
      } catch {
        // ignore
      }
    }
  }, [selectedGenre, history]);

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    const newMute = !isAudioMuted;
    setIsAudioMuted(newMute);
    audioEngine.setMute(newMute);
  }, [isAudioMuted]);

  // Ambient volume change
  const handleChangeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    audioEngine.setAmbientVolume(vol);
  };

  // TTS narration toggle
  const handleToggleNarration = () => {
    const state = speechReader.getState();
    if (state.speaking) {
      speechReader.stop();
    } else if (currentTurn) {
      const textToRead = `Capítulo ${currentTurn.chapterNumber}: ${currentTurn.chapterTitle}. ${currentTurn.narrativeParagraphs.join(' ')}`;
      speechReader.speak(textToRead);
    }
  };

  // Start a new game with chosen genre
  const handleSelectGenre = async (genre: GenreKey, customFlavor?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedGenre(genre);

    // Start genre ambient music
    audioEngine.playGenreAmbient(genre);

    try {
      const res = await fetch('/api/adventure/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          genreLabel: GENRES[genre].name,
          isInitial: true,
          playerAction: customFlavor ? `Comenzar con perfil: ${customFlavor}` : 'Comenzar aventura',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const turnData = await res.json();
      const initialTurn: ChapterTurn = {
        id: `turn-1-${Date.now()}`,
        genre,
        genreName: GENRES[genre].name,
        chapterNumber: turnData.chapterNumber || 1,
        chapterTitle: turnData.chapterTitle || 'El Inicio del Destino',
        narrativeParagraphs: turnData.narrativeParagraphs || [turnData.rawMarkdown],
        rawMarkdown: turnData.rawMarkdown,
        location: turnData.location || 'Punto de Partida',
        inventoryAndStatus: turnData.inventoryAndStatus || ['Equipamiento inicial'],
        currentObjective: turnData.currentObjective || 'Dar los primeros pasos',
        options: turnData.options || [],
        playerHealth: turnData.playerHealth ?? 90,
        timelineBranchId: turnData.timelineBranchId || 'α-01',
        timestamp: Date.now(),
      };

      setHistory([initialTurn]);
      setCurrentTurn(initialTurn);
    } catch (err) {
      console.error('Failed to generate initial chapter:', err);
      setErrorMessage('No se pudo contactar al servidor. Comprueba tu conexión o reintenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Advance turn based on player choice
  const handleSelectOption = async (option: ChapterOption) => {
    if (!currentTurn || !selectedGenre || isLoading) return;
    executeTurn(option.title);
  };

  // Advance turn based on custom action
  const handleSubmitCustomAction = async (
    customAction: string,
    fateRoll?: { d20: number; description: string }
  ) => {
    if (!currentTurn || !selectedGenre || isLoading) return;
    executeTurn(customAction, fateRoll);
  };

  // Common turn execution logic
  const executeTurn = async (
    actionText: string,
    fateRoll?: { d20: number; description: string }
  ) => {
    if (!currentTurn || !selectedGenre) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Stop previous speech narration if running
    speechReader.stop();

    try {
      const historyPayload = history.map((h) => ({
        chapterNumber: h.chapterNumber,
        title: h.chapterTitle,
        actionTaken: h.actionTaken || 'Acción previa',
        summary: h.narrativeParagraphs[0] || '',
      }));

      const res = await fetch('/api/adventure/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenre,
          genreLabel: GENRES[selectedGenre].name,
          previousHistory: historyPayload,
          playerAction: actionText,
          isInitial: false,
          currentStatus: {
            location: currentTurn.location,
            inventory: currentTurn.inventoryAndStatus,
            health: currentTurn.playerHealth,
            objective: currentTurn.currentObjective,
          },
          fateRoll,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const turnData = await res.json();
      const nextTurnNumber = (currentTurn.chapterNumber || history.length) + 1;

      const newTurn: ChapterTurn = {
        id: `turn-${nextTurnNumber}-${Date.now()}`,
        genre: selectedGenre,
        genreName: GENRES[selectedGenre].name,
        chapterNumber: turnData.chapterNumber || nextTurnNumber,
        chapterTitle: turnData.chapterTitle || `Capítulo ${nextTurnNumber}`,
        narrativeParagraphs: turnData.narrativeParagraphs || [turnData.rawMarkdown],
        rawMarkdown: turnData.rawMarkdown,
        location: turnData.location || currentTurn.location,
        inventoryAndStatus: turnData.inventoryAndStatus || currentTurn.inventoryAndStatus,
        currentObjective: turnData.currentObjective || currentTurn.currentObjective,
        options: turnData.options || [],
        playerHealth: turnData.playerHealth ?? Math.max(10, currentTurn.playerHealth - 5),
        actionTaken: actionText,
        timelineBranchId: turnData.timelineBranchId || `T-${nextTurnNumber}`,
        timestamp: Date.now(),
        fateRoll,
      };

      setHistory((prev) => [...prev, newTurn]);
      setCurrentTurn(newTurn);
    } catch (err) {
      console.error('Error in CYOA turn execution:', err);
      setErrorMessage('Ocurrió un error al procesar la elección. Se ha reanudado la línea temporal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Time travel / Rewind to a previous chapter in the multiverse
  const handleRewindToChapter = (chapterNumber: number) => {
    const targetTurnIndex = history.findIndex((h) => h.chapterNumber === chapterNumber);
    if (targetTurnIndex === -1) return;

    // Prune history up to that chapter
    const rewoundHistory = history.slice(0, targetTurnIndex + 1);
    const targetTurn = rewoundHistory[rewoundHistory.length - 1];

    setHistory(rewoundHistory);
    setCurrentTurn(targetTurn);
    speechReader.stop();
  };

  // Reset / New Game
  const handleNewGame = () => {
    speechReader.stop();
    audioEngine.stopAmbient();
    setSelectedGenre(null);
    setCurrentTurn(null);
    setHistory([]);
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
  };

  // Load game from slot
  const handleLoadGame = (savedHistory: ChapterTurn[], genre: GenreKey) => {
    speechReader.stop();
    setSelectedGenre(genre);
    setHistory(savedHistory);
    const last = savedHistory[savedHistory.length - 1];
    setCurrentTurn(last);
    audioEngine.playGenreAmbient(genre);
  };

  const activeGenreDef = selectedGenre ? GENRES[selectedGenre] : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Header Bar */}
      <Header
        currentGenreDef={activeGenreDef}
        chapterCount={history.length}
        onOpenMultiverse={() => setIsMultiverseOpen(true)}
        onOpenChronicle={() => setIsChronicleOpen(true)}
        onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
        onNewGame={handleNewGame}
        isAudioMuted={isAudioMuted}
        onToggleMute={handleToggleMute}
        ambientVolume={ambientVolume}
        onChangeAmbientVolume={handleChangeAmbientVolume}
        isNarrationActive={isNarrationActive}
        onToggleNarration={handleToggleNarration}
      />

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-300 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-mono"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        {!selectedGenre || !currentTurn ? (
          <WelcomeGenreScreen
            onSelectGenre={handleSelectGenre}
            isLoading={isLoading}
          />
        ) : (
          <ChapterView
            currentTurn={currentTurn}
            genreDef={activeGenreDef!}
            onSelectOption={handleSelectOption}
            onSubmitCustomAction={handleSubmitCustomAction}
            isLoading={isLoading}
            historyLength={history.length}
          />
        )}
      </main>

      {/* Multiverse Branches Tree Modal */}
      {activeGenreDef && (
        <MultiverseMapModal
          isOpen={isMultiverseOpen}
          onClose={() => setIsMultiverseOpen(false)}
          history={history}
          currentChapterNumber={currentTurn?.chapterNumber || 1}
          genreDef={activeGenreDef}
          onRewindToChapter={handleRewindToChapter}
        />
      )}

      {/* Chronicle / Grimoire Journal Modal */}
      {activeGenreDef && (
        <ChronicleModal
          isOpen={isChronicleOpen}
          onClose={() => setIsChronicleOpen(false)}
          history={history}
          genreDef={activeGenreDef}
        />
      )}

      {/* Save & Load Slots Modal */}
      <SaveLoadModal
        isOpen={isSaveLoadOpen}
        onClose={() => setIsSaveLoadOpen(false)}
        currentHistory={history}
        currentGenre={selectedGenre}
        onLoadGame={handleLoadGame}
      />
    </div>
  );
}
