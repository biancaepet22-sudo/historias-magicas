import React, { useState } from 'react';
import { ChapterTurn, GenreDefinition } from '../types/adventure';
import { BookOpen, X, Download, Copy, Check, Printer, FileText } from 'lucide-react';

interface ChronicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChapterTurn[];
  genreDef: GenreDefinition;
}

export const ChronicleModal: React.FC<ChronicleModalProps> = ({
  isOpen,
  onClose,
  history,
  genreDef,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateFullText = () => {
    let fullStory = `# ${genreDef.name.toUpperCase()}\n`;
    fullStory += `Crónicas del Multiverso: Elige Tu Propia Aventura\n\n`;
    fullStory += `==============================================\n\n`;

    history.forEach((turn) => {
      fullStory += `${turn.rawMarkdown}\n\n`;
      if (turn.actionTaken) {
        fullStory += `>> Elección tomada por el jugador: "${turn.actionTaken}"\n\n`;
      }
      fullStory += `==============================================\n\n`;
    });

    return fullStory;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateFullText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronica-${genreDef.id}-multiverso.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-zinc-900 border border-zinc-700 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
                La Gran Crónica de Aventuras
              </h3>
              <p className="text-xs text-zinc-400">
                Tu novela interactiva completa hasta el momento ({history.length} capítulos registrados)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar texto completo al portapapeles"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar como archivo Markdown (.md)"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Descargar .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story scroll canvas */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-12 flex-1 bg-zinc-950 font-serif print:bg-white print:text-black print:overflow-visible">
          <div className="text-center space-y-2 border-b border-zinc-800/80 pb-8 print:border-black">
            <span className="text-xs font-mono tracking-widest uppercase text-zinc-400 print:text-gray-600">
              {genreDef.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 print:text-black">
              Crónica de la Rama Primaria
            </h1>
            <p className="text-xs text-zinc-400 italic print:text-gray-600">
              Registrado por el Motor de Ficción Ramificada en Tiempo Real
            </p>
          </div>

          {history.map((turn) => (
            <article key={turn.id} className="space-y-4 pb-8 border-b border-zinc-800/60 print:border-gray-300">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 print:text-gray-600">
                <span>Capítulo {turn.chapterNumber}</span>
                <span>Ubicación: {turn.location}</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-100 print:text-black">
                {turn.chapterTitle}
              </h2>

              <div className="space-y-3 text-zinc-300 leading-relaxed text-base print:text-black">
                {turn.narrativeParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {turn.actionTaken && (
                <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 print:bg-gray-100 print:border-gray-300 print:text-black">
                  <span className="text-indigo-400 font-bold print:text-indigo-700">Decisión tomada: </span>
                  "{turn.actionTaken}"
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cerrar Crónica
          </button>
        </div>
      </div>
    </div>
  );
};
