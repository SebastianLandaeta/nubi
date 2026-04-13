// Componentes reutilizables
import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import { GoogleGenAI } from "@google/genai";
import { useState, useEffect } from "react";

// Imágenes
import cloudsTop from "./assets/clouds-top.png";
import cloudsBottom from "./assets/clouds-bottom.png";
import nubi1 from "./assets/nubi-1.png";
import nubi2 from "./assets/nubi-2.png";

// Estilos
import "./chatbot.css";

// Interfaz para los mensajes del chat
interface Message {
  role: "user" | "model";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hola, Soy NUBI, tu robot amigo con inteligencia artificial. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para grabación de voz
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // Para alternar entre dos imágenes de Nubi y dar más vida al chat
  let modelCount = 0;

  const generateWithFallback = async (history: any[]) => {
    try {
      // Intento principal
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
      });

      return response.text || "";
    } catch (err: any) {
      console.warn("Fallo con gemini-3-flash-preview:", err);

      const msg = err?.message?.toLowerCase() || "";

      // Solo fallback si es error de cuota/tokens
      if (
        msg.includes("quota") ||
        msg.includes("token") ||
        msg.includes("limit") ||
        msg.includes("rate")
      ) {
        console.log("Usando fallback: gemini-2.5-flash");

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: history,
        });

        return response.text || "";
      }

      throw err; // otros errores no
    }
  };

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = "es-ES";
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Coloca el texto transcrito en el input
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        setError("Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.");
      } else if (event.error === "network") {
        setError("Error de red. Verifica tu conexión a internet o la configuración de seguridad (CSP).");
      } else {
        setError("Error al grabar audio. Código: " + event.error);
      }
    };

    setRecognition(recognitionInstance);

    // Limpiar al desmontar
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, []);

  // Función que devuelve una promesa con las voces cuando estén listas
  const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    });
  };

  // Función para hablar el texto usando la voz
  const speak = async (text: string) => {
    window.speechSynthesis.cancel();

    const voices = await waitForVoices();

    // Buscar español
    const spanishVoices = voices.filter(v => v.lang.startsWith("es"));

    // Intentar buscar voz masculina
    let selectedVoice =
      spanishVoices.find(v => v.name.toLowerCase().includes("male")) ||
      spanishVoices.find(v => v.name.toLowerCase().includes("mascul")) ||
      spanishVoices[0]; // fallback

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = "es-ES";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  // filtro infantil
  const isSafeForKids = (text: string) => {
    const forbiddenWords = [
      "sexo",
      "sexual",
      "violencia",
      "matar",
      "arma",
      "sangre",
      "droga",
      "porn",
      "muerte",
      "suicidio",
      "pelea",
      "gore",
      "violar",
    ];
    return !forbiddenWords.some((word) =>
      text.toLowerCase().includes(word)
    );
  };

  // Funciones para controlar grabación
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Empezar a grabar, con manejo de errores
  const startRecording = () => {
    if (!recognition) {
      setError("Reconocimiento de voz no soportado en este navegador.");
      return;
    }
    setError(null);
    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar la grabación.");
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // Función para enviar mensaje y obtener respuesta de la IA
  const handleSend = async () => {
    const textToSend = input;

    if (!textToSend.trim()) return;

    if (!isSafeForKids(textToSend)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Lo siento, de eso no puedo hablar. ¿Quieres que hablemos de animales, colores o juegos?",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const systemInstruction = { // Reglas y comportamiento del robot
        role: "model",
        parts: [
          {
            text: `Eres Nubi, un robot amigable para niños de 3 a 5 años.
            Usa lenguaje simple, frases cortas y nunca uses emojis.
            Nunca hables de temas peligrosos o inapropiados.`,
          },
        ],
      };

      const history = [ 
        systemInstruction,
        ...messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: textToSend }] },
      ];

      const assistantText = await generateWithFallback(history);

      if (assistantText) {
        const assistantMessage: Message = {
          role: "model",
          content: assistantText,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error(err);
      setError("Ups, algo salió mal con Nubi.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizado del componente
  return (
    <div className="chat">
      <NavBar />

      <img src={cloudsTop} alt="Nubes arriba" draggable={false} />

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => {
            const isModel = msg.role === "model";

            let nubiImage = nubi1;
            if (isModel) {
              nubiImage = modelCount % 2 === 0 ? nubi1 : nubi2;
              modelCount++;
            }

            return (
              <div key={index} className={`message ${msg.role}`}>
                {isModel && (
                  <img
                    src={nubiImage}
                    alt="Nubi"
                    className="nubi-avatar"
                    draggable={false}
                  />
                )}

                <div className="bubble">
                  {msg.content}
                  <button
                    className="speak-btn"
                    onClick={() => speak(msg.content)}
                  >
                    🔊
                </button>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="message model">
              <img src={nubi1} className="nubi-avatar" />
              <div className="bubble typing">
                Nubi está pensando...
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
          />

          {/* Botón de micrófono */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading || !recognitionSupported}
            className={`mic-btn ${isRecording ? "recording" : ""}`}
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>

          <button onClick={handleSend} disabled={loading || isRecording}>Enviar</button>
          
        </div>
      </div>

      <img src={cloudsBottom} alt="Nubes abajo" draggable={false} />

      <Footer />
    </div>
  );
}