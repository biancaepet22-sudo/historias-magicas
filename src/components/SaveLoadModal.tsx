import React, { useState, useEffect } from 'react';
import { SaveSlot, ChapterTurn, GenreKey } from '../types/adventure';
import { GENRES } from '../data/genres';
import { Save, FolderOpen, Trash2, X, Download, Upload, Check } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHistory: ChapterTurn[];
  currentGenre: GenreKey | null;
  onLoadGame: (savedHistory: ChapterTurn[], genre: GenreKey) => void;
}

const STORAGE_KEY = 'multiverse_cyoa_saves_v1';

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  currentHistory,
  currentGenre,
  onLoadGame,
}) => {
  const [slots, setSlots] = useState<Record<string, SaveSlot>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSlots(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleSaveToSlot = (slotId: string) => {
    if (!currentGenre || currentHistory.length === 0) return;
    audioEngine.playSelectSound();

    const lastTurn = currentHistory[currentHistory.length - 1];
    const newSlot: SaveSlot = {
      id: slotId,
      savedAt: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      genre: currentGenre,
      currentChapterNumber: lastTurn.chapterNumber,
      chapterTitle: lastTurn.chapterTitle,
      historyLength: currentHistory.length,
      history: currentHistory,
    };

    const updated = { ...slots, [slotId]: newSlot };
    setSlots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showNotification(`Partida guardada con éxito en ${slotId}`);
  };

  const handleLoadFromSlot = (slotId: string) => {
    const slot = slots[slotId];
    if (!slot) return;
    audioEngine.playSelectSound();
    onLoadGame(slot.history, slot.genre);
    onClose();
  };

  const handleDeleteSlot = (slotId: string) => {
    audioEngine.playSelectSound();
    const updated = { ...slots };
    delete updated[slotId];
    setSlots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showNotification(`Ranura ${slotId} eliminada`);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(slots, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'multiverse-cyoa-saves.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setSlots(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        showNotification('Partidas importadas correctamente');
      } catch {
        alert('Archivo de guardado inválido.');
      }
    };
    reader.readAsText(file);
  };

  const slotList = ['Ranura 1', 'Ranura 2', 'Ranura 3'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-100">
                Guardar y Cargar Partida
              </h3>
              <p className="text-xs text-zinc-400">
                Guarda tu línea temporal en la memoria local del navegador
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

        {/* Notification pill */}
        {successMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs py-2 px-6 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Slot list */}
        <div className="p-6 space-y-4 flex-1 bg-zinc-950">
          {slotList.map((slotName) => {
            const slot = slots[slotName];
            const genreInfo = slot ? GENRES[slot.genre] : null;

            return (
              <div
                key={slotName}
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-zinc-300 uppercase">
                      {slotName}
                    </span>
                    {slot ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${genreInfo?.badgeBg}`}>
                        {genreInfo?.icon} {genreInfo?.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-300 font-mono italic">
                        [Vacío]
                      </span>
                    )}
                  </div>

                  {slot ? (
                    <div className="text-xs text-zinc-400 space-y-0.5">
                      <p className="font-medium text-zinc-200">
                        Capítulo {slot.currentChapterNumber}: {slot.chapterTitle}
                      </p>
                      <p className="text-[11px] text-zinc-300">
                        Guardado el: {slot.savedAt} ({slot.historyLength} capítulos)
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-300">
                      No hay datos guardados en esta ranura.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToSlot(slotName)}
                    disabled={!currentGenre || currentHistory.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-sky-400" />
                    <span>Guardar</span>
                  </button>

                  {slot && (
                    <>
                      <button
                        onClick={() => handleLoadFromSlot(slotName)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Cargar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSlot(slotName)}
                        className="p-1.5 rounded-xl text-zinc-300 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Borrar ranura"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Backup export/import */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Copia (.json)</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
