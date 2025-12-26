
import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeRepository = async (repoUrl: string): Promise<RepoAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza este URL de repositorio de GitHub y predice sus propiedades para un proyecto Android. Asume que es un proyecto Android para la simulación. URL: ${repoUrl}. Responde en ESPAÑOL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          detectedFramework: { type: Type.STRING, description: "ej. React Native, Flutter, Native Kotlin, Native Java" },
          dependencies: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          estimatedSize: { type: Type.STRING },
          buildComplexity: { 
            type: Type.STRING,
            enum: ["Baja", "Media", "Alta"]
          }
        },
        required: ["projectName", "detectedFramework", "dependencies", "estimatedSize", "buildComplexity"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      projectName: "Proyecto Desconocido",
      detectedFramework: "Android Nativo",
      dependencies: ["androidx.appcompat", "com.google.material"],
      estimatedSize: "15.4 MB",
      buildComplexity: "Media"
    };
  }
};

export const generateBuildLogs = async (analysis: RepoAnalysis): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera 15 líneas de registros de construcción (logs) de Android realistas para un proyecto llamado "${analysis.projectName}" usando ${analysis.detectedFramework}. Incluye tareas de Gradle como :app:preBuild, :app:compileDebugKotlin, y termina con BUILD SUCCESSFUL. Todo en el formato de consola técnica.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return ["Ejecutando tareas: [:app:assembleDebug]", "CONSTRUCCIÓN EXITOSA en 45s"];
  }
};
