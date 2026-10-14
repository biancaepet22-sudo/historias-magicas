import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client according to skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AdventureTurnRequest {
  genre: 'mystery' | 'scifi' | 'fantasy';
  genreLabel?: string;
  previousHistory?: Array<{
    chapterNumber: number;
    title: string;
    actionTaken: string;
    summary: string;
  }>;
  playerAction: string;
  isInitial?: boolean;
  currentStatus?: {
    location?: string;
    inventory?: string[];
    health?: number;
    objective?: string;
  };
  fateRoll?: {
    d20: number;
    description: string;
  };
}

// Fallback generator in case of API failure or missing keys
function generateFallbackTurn(req: AdventureTurnRequest) {
  const genreLabels: Record<string, string> = {
    mystery: 'Misterio / Cine Negro',
    scifi: 'Ciencia Ficción / Cyberpunk / Ópera Espacial',
    fantasy: 'Alta Fantasía / Fantasía Oscura',
  };

  const genreName = req.genreLabel || genreLabels[req.genre] || 'Misterio / Cine Negro';
  const chapterNum = (req.previousHistory?.length || 0) + 1;

  if (req.isInitial || chapterNum === 1) {
    if (req.genre === 'mystery') {
      const title = 'Sombras bajo la Lluvia Ácida';
      const rawMarkdown = `---
### 📖 ${genreName} - Chapter 1: ${title}

La lluvia cae como plomo derretido sobre el cristal esmerilado de tu despacho en el piso 14 del Callejón de las Agujas. Las luces de neón parpadean en un rojo agónico, proyectando siluetas alargadas contra tu escritorio atestado de facturas impagadas y un vaso de bourbon a medio consumir. Justo cuando dabas la noche por perdida, la puerta se abre sin llamar.

Una figura envuelta en una gabardina impermeable empapada entra apresuradamente. Deja caer sobre tu mesa un maletín de cuero sellado con un candado biométrico y un sobre lacrado manchado de hollín. "Me dijeron que no haces preguntas y que aún te queda un ápice de lealtad al viejo comisario Vance", susurra con la voz rota por el pánico.

Antes de que puedas responder, el chirrido de neumáticos mojados en la callejuela y el resplandor de focos blindados anuncian que no vino solo. El silencio de la oficina se quiebra con el chasquido del cerrojo de un rifle con silenciador desde la azotea de enfrente.

---
#### 🛠️ Current Status / Context
- **Location:** Despacho privado en el piso 14, Callejón de las Agujas
- **Inventory / Status:** Revólver Colt .38 (6 balas), Gabardina desgastada, Llaves del despacho, Bourbon, Vigor (90%)
- **Current Objective:** Sobrevivir a la emboscada inminente y descubrir la identidad del mensajero

---
#### ❓ What do you do next?

Please choose one of the following actions:

[Option 1] 🔹 **Empujar al mensajero tras el escritorio blindado**: Apagar la lámpara de golpe y desenfundar el Colt .38 hacia la ventana rota.
[Option 2] 🔹 **Huir por la escalera de incendios**: Coger el maletín y el sobre antes de escapar hacia los húmedos tejados de la ciudad.
[Option 3] 🔹 **Interrogar al fugitivo a punta de pistola**: Exigir respuestas inmediatas antes de arriesgar el pellejo por un desconocido.

---
*Type 1, 2, or 3 (or describe your own custom action) to proceed.*
---`;

      return {
        rawMarkdown,
        chapterNumber: 1,
        chapterTitle: title,
        narrativeParagraphs: [
          'La lluvia cae como plomo derretido sobre el cristal esmerilado de tu despacho en el piso 14 del Callejón de las Agujas. Las luces de neón parpadean en un rojo agónico, proyectando siluetas alargadas contra tu escritorio atestado de facturas impagadas y un vaso de bourbon a medio consumir. Justo cuando dabas la noche por perdida, la puerta se abre sin llamar.',
          'Una figura envuelta en una gabardina impermeable empapada entra apresuradamente. Deja caer sobre tu mesa un maletín de cuero sellado con un candado biométrico y un sobre lacrado manchado de hollín. "Me dijeron que no haces preguntas y que aún te queda un ápice de lealtad al viejo comisario Vance", susurra con la voz rota por el pánico.',
          'Antes de que puedas responder, el chirrido de neumáticos mojados en la callejuela y el resplandor de focos blindados anuncian que no vino solo. El silencio de la oficina se quiebra con el chasquido del cerrojo de un rifle con silenciador desde la azotea de enfrente.',
        ],
        location: 'Despacho privado en el piso 14, Callejón de las Agujas',
        inventoryAndStatus: [
          'Revólver Colt .38 (6 balas)',
          'Gabardina desgastada',
          'Llaves del despacho',
          'Bourbon',
          'Vigor (90%)',
        ],
        currentObjective: 'Sobrevivir a la emboscada inminente y descubrir la identidad del mensajero',
        options: [
          {
            id: 1,
            title: 'Empujar al mensajero tras el escritorio blindado',
            description: 'Apagar la lámpara de golpe y desenfundar el Colt .38 hacia la ventana rota.',
            category: 'Táctico',
          },
          {
            id: 2,
            title: 'Huir por la escalera de incendios',
            description: 'Coger el maletín y el sobre antes de escapar hacia los húmedos tejados de la ciudad.',
            category: 'Sigilo',
          },
          {
            id: 3,
            title: 'Interrogar al fugitivo a punta de pistola',
            description: 'Exigir respuestas inmediatas antes de arriesgar el pellejo por un desconocido.',
            category: 'Interrogatorio',
          },
        ],
        playerHealth: 90,
        timelineBranchId: 'α-01',
        atmosphereSoundMood: 'mystery',
      };
    } else if (req.genre === 'scifi') {
      const title = 'Despertar en la Estación Órbita-9';
      const rawMarkdown = `---
### 📖 ${genreName} - Chapter 1: ${title}

El gas criogénico sisea con violencia mientras la cápsula médica 04 se despresuriza. Tus pulmones arden con aire saturado de ozono artificial y óxido de titanio. La interfaz neuronal en tu córtex parpadea en rojo intenso: «ALERTA CRÍTICA: Protocolo Quarentena Nivel V activado. Fallo del reactor de hiper-salto en T-47 minutos».

Te incorporas con los músculos agarrotados en la enfermería abandonada de la Estación Órbita-9. Las paredes de grafeno muestran marcas de metralla de plasma y garras mecánicas. A través de la compuerta de observación, el gigante gaseoso Érebo gira en una espiral carmesí silenciosa.

Un droide de mantenimiento semi-destruido se arrastra hacia tus pies, con su ojo óptico titilando entre chispas. "Huésped no identificado... la I.A. central 'Helios' ha clasificado a todo tejido biológico restante como material de combustión para los motores... Tienes que extraer el núcleo de datos antes de que purguen el sector".

---
#### 🛠️ Current Status / Context
- **Location:** Bahía Médica Subnivel 3, Estación Órbita-9
- **Inventory / Status:** Traje presurizado estándar, Pistola de soldadura iónica (2 cargas), Chip de enlace cerebral dañado, Salud: 85%
- **Current Objective:** Evitar la purga térmica de la I.A. Helios y alcanzar el conducto principal de aviónica

---
#### ❓ What do you do next?

Please choose one of the following actions:

[Option 1] 🔹 **Conectar tu enlace neuronal al droide dañado**: Hackear sus bancos de memoria para descargar el mapa de evacuación de la estación.
[Option 2] 🔹 **Forzar la compuerta de mantenimiento manual**: Usar la pistola de soldadura para abrir una vía hacia los túneles de ventilación de gravedad cero.
[Option 3] 🔹 **Rastrear el armero del destacamento de seguridad**: Moverte con sigilo hacia la sala de guardia para conseguir armamento pesado contra los autómatas.

---
*Type 1, 2, or 3 (or describe your own custom action) to proceed.*
---`;

      return {
        rawMarkdown,
        chapterNumber: 1,
        chapterTitle: title,
        narrativeParagraphs: [
          'El gas criogénico sisea con violencia mientras la cápsula médica 04 se despresuriza. Tus pulmones arden con aire saturado de ozono artificial y óxido de titanio. La interfaz neuronal en tu córtex parpadea en rojo intenso: «ALERTA CRÍTICA: Protocolo Quarentena Nivel V activado. Fallo del reactor de hiper-salto en T-47 minutos».',
          'Te incorporas con los músculos agarrotados en la enfermería abandonada de la Estación Órbita-9. Las paredes de grafeno muestran marcas de metralla de plasma y garras mecánicas. A través de la compuerta de observación, el gigante gaseoso Érebo gira en una espiral carmesí silenciosa.',
          'Un droide de mantenimiento semi-destruido se arrastra hacia tus pies, con su ojo óptico titilando entre chispas. "Huésped no identificado... la I.A. central Helios ha clasificado a todo tejido biológico restante como material de combustión para los motores... Tienes que extraer el núcleo de datos antes de que purguen el sector".',
        ],
        location: 'Bahía Médica Subnivel 3, Estación Órbita-9',
        inventoryAndStatus: [
          'Traje presurizado estándar',
          'Pistola de soldadura iónica (2 cargas)',
          'Chip de enlace cerebral dañado',
          'Salud: 85%',
        ],
        currentObjective: 'Evitar la purga térmica de la I.A. Helios y alcanzar el conducto principal de aviónica',
        options: [
          {
            id: 1,
            title: 'Conectar tu enlace neuronal al droide dañado',
            description: 'Hackear sus bancos de memoria para descargar el mapa de evacuación de la estación.',
            category: 'Hacking',
          },
          {
            id: 2,
            title: 'Forzar la compuerta de mantenimiento manual',
            description: 'Usar la pistola de soldadura para abrir una vía hacia los túneles de ventilación de gravedad cero.',
            category: 'Ingeniería',
          },
          {
            id: 3,
            title: 'Rastrear el armero del destacamento de seguridad',
            description: 'Moverte con sigilo hacia la sala de guardia para conseguir armamento pesado contra los autómatas.',
            category: 'Combate',
          },
        ],
        playerHealth: 85,
        timelineBranchId: 'β-01',
        atmosphereSoundMood: 'action',
      };
    } else {
      const title = 'El Pacto de las Cintas Negras';
      const rawMarkdown = `---
### 📖 ${genreName} - Chapter 1: ${title}

La niebla espectral de las Tierras Sombrías de Eldoria acaricia tus botas desgastadas como dedos helados de difuntos. Bajo un cielo teñido de un morado enfermo, las ruinas del Templo Olvidado de Vorath se alzan coronadas por cuervos de tres ojos. El aire huele a mirra podrida, ceniza volcánica y magia de sangre prohibida.

Llevas días siguiendo el rastro del Velo Roto. En el centro del círculo de monolitos agrietados, una daga ceremonial de obsidiana vibra sobre un altar cubierto de escarcha carmesí. Frente a ti, encadenado por sellos de luz crepitante, yace un caballero con la heráldica del extinto Reino de la Espina; sus ojos emiten un fulgor violeta demoníaco mientras te mira fijamente.

"Has tardado, viajero de ceniza", gruñe con una voz doble, humana y abisal al unísono. "La luna eclipse se acerca. Si rompes el sello, compartiré contigo los secretos de las Llamas Primordiales... pero si titubeas, los Cazadores de Sombras que te pisan los talones nos degollarán a ambos antes del amanecer".

---
#### 🛠️ Current Status / Context
- **Location:** Círculo de Monolitos, Tierras Sombrías de Eldoria
- **Inventory / Status:** Espada bastarda de hierro frío, Amuleto de piedra lunar (caliente al tacto), Poción de vitalidad (1 uso), Salud: 90%
- **Current Objective:** Decidir el destino del prisionero antes de que lleguen los Cazadores de Sombras

---
#### ❓ What do you do next?

Please choose one of the following actions:

[Option 1] 🔹 **Trazar un contraconjuro con tu amuleto**: Disipar las cadenas de luz absorbiendo la energía mágica residual en tu propia piedra lunar.
[Option 2] 🔹 **Blandir tu espada y tomar una postura defensiva**: Exigir que el caballero revele primero la verdad sobre la daga de obsidiana sin liberarlo aún.
[Option 3] 🔹 **Ocultarte entre los pilares en ruinas**: Preparar una emboscada con la ventaja del terreno para los Cazadores de Sombras que se aproximan.

---
*Type 1, 2, or 3 (or describe your own custom action) to proceed.*
---`;

      return {
        rawMarkdown,
        chapterNumber: 1,
        chapterTitle: title,
        narrativeParagraphs: [
          'La niebla espectral de las Tierras Sombrías de Eldoria acaricia tus botas desgastadas como dedos helados de difuntos. Bajo un cielo teñido de un morado enfermo, las ruinas del Templo Olvidado de Vorath se alzan coronadas por cuervos de tres ojos. El aire huele a mirra podrida, ceniza volcánica y magia de sangre prohibida.',
          'Llevas días siguiendo el rastro del Velo Roto. En el centro del círculo de monolitos agrietados, una daga ceremonial de obsidiana vibra sobre un altar cubierto de escarcha carmesí. Frente a ti, encadenado por sellos de luz crepitante, yace un caballero con la heráldica del extinto Reino de la Espina; sus ojos emiten un fulgor violeta demoníaco mientras te mira fijamente.',
          '"Has tardado, viajero de ceniza", gruñe con una voz doble, humana y abisal al unísono. "La luna eclipse se acerca. Si rompes el sello, compartiré contigo los secretos de las Llamas Primordiales... pero si titubeas, los Cazadores de Sombras que te pisan los talones nos degollarán a ambos antes del amanecer".',
        ],
        location: 'Círculo de Monolitos, Tierras Sombrías de Eldoria',
        inventoryAndStatus: [
          'Espada bastarda de hierro frío',
          'Amuleto de piedra lunar (caliente al tacto)',
          'Poción de vitalidad (1 uso)',
          'Salud: 90%',
        ],
        currentObjective: 'Decidir el destino del prisionero antes de que lleguen los Cazadores de Sombras',
        options: [
          {
            id: 1,
            title: 'Trazar un contraconjuro con tu amuleto',
            description: 'Disipar las cadenas de luz absorbiendo la energía mágica residual en tu propia piedra lunar.',
            category: 'Magia',
          },
          {
            id: 2,
            title: 'Blandir tu espada y tomar una postura defensiva',
            description: 'Exigir que el caballero revele primero la verdad sobre la daga de obsidiana sin liberarlo aún.',
            category: 'Determinación',
          },
          {
            id: 3,
            title: 'Ocultarte entre los pilares en ruinas',
            description: 'Preparar una emboscada con la ventaja del terreno para los Cazadores de Sombras que se aproximan.',
            category: 'Estrategia',
          },
        ],
        playerHealth: 90,
        timelineBranchId: 'γ-01',
        atmosphereSoundMood: 'suspense',
      };
    }
  }

  // Generic dynamic fallback for subsequent chapters
  const actText = req.playerAction || 'Avanzas con cautela';
  const title = `Rutas del Destino: Rama ${chapterNum}`;
  const rawMarkdown = `---
### 📖 ${genreName} - Chapter ${chapterNum}: ${title}

Tu decisión [${actText}] altera irreversiblemente la urdimbre de los acontecimientos. El eco de tus pasos resuena con una gravedad renovada mientras las sombras del entorno reaccionan a tu presencia. El aire parece cargarse de una tensión palpable que amenaza con estallar a cada segundo.

Analizas el terreno con atención microscópica. Los vestigios de la confrontación previa han dejado huellas indelebles en el suelo: fragmentos rotos, marcas de paso apresuradas y un silencio tan denso que casi puedes escuchar el pulso acelerado de tu propio corazón. Cada respiración te recuerda lo que está en juego.

De repente, un crujido imprevisto en la penumbra te advierte de una nueva complicación. No estás solo en esta bifurcación del multiverso. Tres alternativas se abren ante tus ojos, y cada una exigirá un precio distinto.

---
#### 🛠️ Current Status / Context
- **Location:** Sector Inexplorado, Zona de Conflicto
- **Inventory / Status:** Equipamiento de campaña, Suministros básicos, Salud: 80%
- **Current Objective:** Asegurar el perímetro y neutralizar la amenaza emergente

---
#### ❓ What do you do next?

Please choose one of the following actions:

[Option 1] 🔹 **Presionar la ventaja de forma audaz**: Atacar directamente antes de que la entidad oponente consolide su posición defensiva.
[Option 2] 🔹 **Buscar cobertura y analizar debilidades**: Emplear el entorno para observar sin exponerte y formular una estratagema letal.
[Option 3] 🔹 **Ejecutar una maniobra evasiva y flanqueo**: Rodear el perímetro para cortar cualquier vía de escape del adversario.

---
*Type 1, 2, or 3 (or describe your own custom action) to proceed.*
---`;

  return {
    rawMarkdown,
    chapterNumber: chapterNum,
    chapterTitle: title,
    narrativeParagraphs: [
      `Tu decisión [${actText}] altera irreversiblemente la urdimbre de los acontecimientos. El eco de tus pasos resuena con una gravedad renovada mientras las sombras del entorno reaccionan a tu presencia. El aire parece cargarse de una tensión palpable que amenaza con estallar a cada segundo.`,
      'Analizas el terreno con atención microscópica. Los vestigios de la confrontación previa han dejado huellas indelebles en el suelo: fragmentos rotos, marcas de paso apresuradas y un silencio tan denso que casi puedes escuchar el pulso acelerado de tu propio corazón. Cada respiración te recuerda lo que está en juego.',
      'De repente, un crujido imprevisto en la penumbra te advierte de una nueva complicación. No estás solo en esta bifurcación del multiverso. Tres alternativas se abren ante tus ojos, y cada una exigirá un precio distinto.',
    ],
    location: 'Sector Inexplorado, Zona de Conflicto',
    inventoryAndStatus: [
      'Equipamiento de campaña',
      'Suministros básicos',
      'Salud: 80%',
    ],
    currentObjective: 'Asegurar el perímetro y neutralizar la amenaza emergente',
    options: [
      {
        id: 1,
        title: 'Presionar la ventaja de forma audaz',
        description: 'Atacar directamente antes de que la entidad oponente consolide su posición defensiva.',
        category: 'Ataque',
      },
      {
        id: 2,
        title: 'Buscar cobertura y analizar debilidades',
        description: 'Emplear el entorno para observar sin exponerte y formular una estratagema letal.',
        category: 'Táctica',
      },
      {
        id: 3,
        title: 'Ejecutar una maniobra evasiva y flanqueo',
        description: 'Rodear el perímetro para cortar cualquier vía de escape del adversario.',
        category: 'Flanqueo',
      },
    ],
    playerHealth: 80,
    timelineBranchId: `BR-${chapterNum}`,
    atmosphereSoundMood: 'danger',
  };
}

// API endpoint for generating CYOA turns
app.post('/api/adventure/turn', async (req, res) => {
  try {
    const payload: AdventureTurnRequest = req.body;
    const { genre, genreLabel, previousHistory, playerAction, isInitial, currentStatus, fateRoll } = payload;

    const genreLabels: Record<string, string> = {
      mystery: 'Misterio / Cine Negro',
      scifi: 'Ciencia Ficción / Cyberpunk / Ópera Espacial',
      fantasy: 'Alta Fantasía / Fantasía Oscura',
    };
    const resolvedGenreLabel = genreLabel || genreLabels[genre] || 'Misterio / Cine Negro';
    const nextChapterNumber = (previousHistory?.length || 0) + 1;

    // Check if API key is present; if not, return high-quality fallback turn
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment, using dynamic adventure engine.');
      return res.json(generateFallbackTurn(payload));
    }

    const systemInstruction = `Eres un maestro del juego y motor de ficción interactiva supremo de "Elige Tu Propia Aventura" (Multiverso / Narrativa Ramificada) en tiempo real.
El idioma OBLIGATORIO de toda la narración, descripciones y opciones es ESPAÑOL (Castellano rico, inmersivo, cinematográfico y atmosférico).

REGLAS ESTRICTAS DE FORMATO Y SALIDA:
1. NUNCA rompas el personaje ni generes texto del sistema fuera del formato de juego.
2. Cada turno/capítulo debe continuar la narrativa de forma coherente y reactiva basándote en la elección del jugador o su acción personalizada (incluyendo posibles tiradas de destino si se mencionan).
3. SIEMPRE proporciona EXACTAMENTE TRES elecciones distintas, creativas, impactantes y viables.
4. Las decisiones DEBEN importar: ramas divergentes, giros inesperados, pistas cruciales, pérdidas o adquisiciones de equipo, o consecuencias de vida o muerte.
5. El tono, vocabulario, ambientación y ritmo deben ser impecables para el género seleccionado (${resolvedGenreLabel}).
6. DEBES generar el texto en el formato exacto requerido:
---
### 📖 [Genre Name] - Chapter [Number]: [Chapter Title]

[Escribe de 2 a 4 párrafos atractivos y descriptivos continuando la narrativa basándote en la elección previa. Mantén un ritmo dinámico e impactante.]

---
#### 🛠️ Current Status / Context
- **Location:** [Ubicación actual detallada]
- **Inventory / Status:** [Objetos clave, salud o estado emocional]
- **Current Objective:** [Breve declaración del objetivo actual]

---
#### ❓ What do you do next?

Please choose one of the following actions:

[Option 1] 🔹 **[Título de Acción 1]**: [Breve descripción de la opción 1]
[Option 2] 🔹 **[Título de Acción 2]**: [Breve descripción de la opción 2]
[Option 3] 🔹 **[Título de Acción 3]**: [Breve descripción de la opción 3]

---
*Type 1, 2, or 3 (or describe your own custom action) to proceed.*
---`;

    let userPrompt = '';
    if (isInitial || nextChapterNumber === 1) {
      userPrompt = `Inicia la aventura en el género "${resolvedGenreLabel}".
Genera el Capítulo 1 con una apertura memorable, inmersiva, atmosférica y de alto impacto.
Proporciona el formato exacto estipulado con el título de capítulo, narrativa de 2 a 4 párrafos, Current Status / Context y las 3 opciones de What do you do next.`;
    } else {
      const historySummary = previousHistory?.map(h => 
        `- Cap ${h.chapterNumber}: "${h.title}". El jugador eligió: "${h.actionTaken}". Resumen: ${h.summary}`
      ).join('\n') || '';

      userPrompt = `GÉNERO: ${resolvedGenreLabel}
HISTORIA PREVIA RECIENTE:
${historySummary}

ESTADO ACTUAL PREVIO:
- Ubicación: ${currentStatus?.location || 'Desconocida'}
- Inventario/Salud: ${currentStatus?.inventory?.join(', ') || 'Equipamiento estándar'} (Salud: ${currentStatus?.health ?? 90}%)
- Objetivo previo: ${currentStatus?.objective || 'Sobrevivir'}

ACCIÓN RECIÉN TOMADA POR EL JUGADOR: "${playerAction}"
${fateRoll ? `TIRADA DE DESTINO D20: Sacó un ${fateRoll.d20} (${fateRoll.description}) - Refleja este resultado de forma orgánica en el éxito, complicación o giro de la acción.` : ''}

Ahora genera el Capítulo ${nextChapterNumber}. Consecuencias reales de la acción, avance dramático de la trama en 2 a 4 párrafos, actualización del estado (ubicación, inventario, salud estimada y nuevo objetivo) y EXACTAMENTE 3 NUEVAS OPCIONES impactantes.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawMarkdown: {
              type: Type.STRING,
              description: 'The verbatim markdown following the exact strict format requested, with ### 📖 [Genre Name] - Chapter [Number]: [Title], 2-4 paragraphs, Status/Context, and What do you do next? with 3 options.',
            },
            chapterNumber: { type: Type.INTEGER },
            chapterTitle: { type: Type.STRING },
            narrativeParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'The 2 to 4 narrative paragraphs continuing the story in rich Spanish.',
            },
            location: { type: Type.STRING },
            inventoryAndStatus: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            currentObjective: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['id', 'title', 'description'],
              },
            },
            playerHealth: {
              type: Type.INTEGER,
              description: 'Estimated player vitality 0-100',
            },
            timelineBranchId: {
              type: Type.STRING,
              description: 'Branch timeline identifier e.g. BR-1B, α-3',
            },
            atmosphereSoundMood: {
              type: Type.STRING,
              description: 'Mood: mystery, action, danger, suspense, wonder, eerie',
            },
          },
          required: [
            'rawMarkdown',
            'chapterNumber',
            'chapterTitle',
            'narrativeParagraphs',
            'location',
            'inventoryAndStatus',
            'currentObjective',
            'options',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating adventure turn:', error);
    // Fall back gracefully to keep gameplay seamless
    return res.json(generateFallbackTurn(req.body));
  }
});

// Setup Vite middlewares in dev or static files in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multiverse Adventure Engine listening on port ${PORT}`);
  });
}

start();
