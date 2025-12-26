
import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Settings, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Download, 
  Smartphone, 
  Cpu, 
  Box,
  Layers,
  ArrowRight,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { BuildStatus, BuildStep, BuildLog, RepoAnalysis } from './types';
import { analyzeRepository, generateBuildLogs } from './services/geminiService';

const INITIAL_STEPS: BuildStep[] = [
  { id: '1', name: 'Control de Código', description: 'Clonando repositorio y verificando rama...', status: 'pending' },
  { id: '2', name: 'Análisis con IA', description: 'Detectando framework y dependencias...', status: 'pending' },
  { id: '3', name: 'Sincronización Gradle', description: 'Resolviendo artefactos y estructura...', status: 'pending' },
  { id: '4', name: 'Compilación', description: 'Transformando código fuente a archivos DEX...', status: 'pending' },
  { id: '5', name: 'Optimización', description: 'Ejecutando ProGuard/R8 para reducir tamaño...', status: 'pending' },
  { id: '6', name: 'Firma de Artefacto', description: 'Aplicando firma de keystore de depuración...', status: 'pending' }
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [status, setStatus] = useState<BuildStatus>(BuildStatus.IDLE);
  const [steps, setSteps] = useState<BuildStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLog = (message: string, type: BuildLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    }]);
  };

  const updateStepStatus = (id: string, newStatus: BuildStep['status']) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status: newStatus } : step));
  };

  const handleStartBuild = async () => {
    if (!repoUrl.includes('github.com')) {
      alert('Por favor, ingresa una URL válida de repositorio de GitHub');
      return;
    }

    if (!appIcon) {
      alert('Por favor, selecciona un icono para tu aplicación antes de comenzar');
      return;
    }

    setStatus(BuildStatus.CLONING);
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));
    setLogs([]);
    setProgress(5);
    
    try {
      updateStepStatus('1', 'running');
      addLog(`Conectando con GitHub...`);
      addLog(`Clonando repositorio: ${repoUrl}...`);
      await new Promise(r => setTimeout(r, 1500));
      updateStepStatus('1', 'completed');
      setProgress(20);

      setStatus(BuildStatus.ANALYZING);
      updateStepStatus('2', 'running');
      addLog(`Gemini IA analizando estructura del proyecto...`);
      const repoData = await analyzeRepository(repoUrl);
      setAnalysis(repoData);
      addLog(`Proyecto ${repoData.detectedFramework} detectado: ${repoData.projectName}`, 'success');
      addLog(`Dependencias encontradas: ${repoData.dependencies.slice(0, 3).join(', ')}...`);
      await new Promise(r => setTimeout(r, 1000));
      updateStepStatus('2', 'completed');
      setProgress(40);

      setStatus(BuildStatus.BUILDING);
      updateStepStatus('3', 'running');
      addLog(`Iniciando sincronización de Gradle...`);
      const buildLogs = await generateBuildLogs(repoData);
      
      for (let i = 0; i < buildLogs.length; i++) {
        if (i === 3) {
            updateStepStatus('3', 'completed');
            updateStepStatus('4', 'running');
        }
        addLog(buildLogs[i], buildLogs[i].includes('ERROR') ? 'error' : 'info');
        setProgress(prev => Math.min(prev + 4, 85));
        await new Promise(r => setTimeout(r, 400));
      }
      updateStepStatus('4', 'completed');

      updateStepStatus('5', 'running');
      addLog(`Optimizando recursos del APK...`);
      await new Promise(r => setTimeout(r, 2000));
      updateStepStatus('5', 'completed');
      setProgress(92);

      setStatus(BuildStatus.SIGNING);
      updateStepStatus('6', 'running');
      addLog(`Generando firma digital de depuración...`);
      await new Promise(r => setTimeout(r, 1500));
      updateStepStatus('6', 'completed');
      
      setStatus(BuildStatus.COMPLETED);
      setProgress(100);
      addLog(`¡Construcción exitosa! APK generado correctamente.`, 'success');

    } catch (error) {
      setStatus(BuildStatus.FAILED);
      addLog(`Error en la construcción: ${error}`, 'error');
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'failed' } : s));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto">
      {/* Cabecera */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RepoForge</h1>
            <p className="text-slate-400 text-sm">GitHub a APK • Constructor Cloud</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Izquierda: Inputs y Configuración */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="glass rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Origen del Proyecto
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/usuario/mi-app-android"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pl-11"
                  disabled={status !== BuildStatus.IDLE && status !== BuildStatus.COMPLETED && status !== BuildStatus.FAILED}
                />
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              </div>

              {/* Selector de Icono */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Icono de la Aplicación</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${appIcon ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleIconUpload}
                  />
                  {appIcon ? (
                    <div className="flex items-center gap-4 w-full">
                      <img src={appIcon} alt="App Icon" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-400">Icono cargado</p>
                        <p className="text-xs text-slate-500">Haz clic para cambiarlo</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500" />
                      <p className="text-sm text-slate-400 text-center">Subir icono de la app (.png, .jpg)</p>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleStartBuild}
                disabled={status !== BuildStatus.IDLE && status !== BuildStatus.COMPLETED && status !== BuildStatus.FAILED}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-5 h-5" />
                Generar APK Ahora
              </button>
            </div>
          </section>

          {/* Resumen de Análisis */}
          {analysis && (
            <section className="glass rounded-3xl p-6 border-l-4 border-indigo-500 animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">Resumen de IA</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Framework
                  </p>
                  <p className="font-semibold text-indigo-400">{analysis.detectedFramework}</p>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Box className="w-3 h-3" /> Tamaño Est.
                  </p>
                  <p className="font-semibold text-indigo-400">{analysis.estimatedSize}</p>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Complejidad
                  </p>
                  <p className="font-semibold text-indigo-400">{analysis.buildComplexity}</p>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Play className="w-3 h-3" /> Plataforma
                  </p>
                  <p className="font-semibold text-indigo-400">Android SDK 34</p>
                </div>
              </div>
            </section>
          )}

          {/* Pasos de Construcción */}
          <section className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              Túnel de Construcción
            </h3>
            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative flex gap-4">
                  {idx !== steps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-full ${step.status === 'completed' ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                  )}
                  
                  <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    step.status === 'completed' ? 'bg-indigo-500' : 
                    step.status === 'running' ? 'bg-amber-500 animate-pulse' : 
                    step.status === 'failed' ? 'bg-red-500' : 'bg-slate-800'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-white" /> : 
                     step.status === 'failed' ? <XCircle className="w-5 h-5 text-white" /> : 
                     <span className="text-xs font-bold text-white">{idx + 1}</span>}
                  </div>
                  
                  <div className="flex flex-col">
                    <h4 className={`text-sm font-semibold ${step.status === 'running' ? 'text-white' : 'text-slate-300'}`}>
                      {step.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Derecha: Consola y Artefacto Final */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Barra de Progreso */}
          {status !== BuildStatus.IDLE && (
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-indigo-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Salida de Consola */}
          <section className="glass rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl border-slate-700/50 min-h-[400px]">
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Consola de Construcción</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            
            <div className="flex-1 bg-black/40 p-4 font-mono text-xs overflow-y-auto max-h-[500px] space-y-1.5 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 opacity-50">
                  <Terminal className="w-12 h-12" />
                  <p>Esperando link del repositorio para iniciar secuencia...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'error' ? 'text-red-400 font-bold' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </section>

          {/* Éxito y Simulación de Instalación */}
          {status === BuildStatus.COMPLETED && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-500">
              {/* Artefacto */}
              <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
                <div className="bg-emerald-500 p-3 rounded-full mb-4 shadow-xl shadow-emerald-500/20">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¡APK Listo!</h3>
                <p className="text-sm text-emerald-400/80 mb-6">
                  Archivo optimizado y firmado listo para distribución.
                </p>
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10">
                  Descargar APK
                </button>
              </section>

              {/* Simulación en Celular */}
              <section className="glass rounded-3xl p-6 border-slate-700/50 flex flex-col items-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest">Vista Previa en Dispositivo</p>
                <div className="relative w-32 h-64 bg-slate-900 rounded-[2.5rem] border-[4px] border-slate-800 shadow-2xl flex flex-col items-center pt-10">
                  {/* Pantalla de inicio simulada */}
                  <div className="absolute inset-2 bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-[2rem] overflow-hidden">
                    <div className="h-full w-full flex flex-col items-center justify-center gap-1">
                      {appIcon ? (
                        <img src={appIcon} alt="App" className="w-10 h-10 rounded-xl shadow-lg border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl" />
                      )}
                      <span className="text-[8px] font-medium text-white/80 truncate w-14 text-center">
                        {analysis?.projectName || 'Mi App'}
                      </span>
                    </div>
                  </div>
                  {/* Cámara/Sensores */}
                  <div className="absolute top-4 w-12 h-1 bg-slate-800 rounded-full" />
                </div>
                <p className="mt-4 text-xs text-slate-400">Instalada con éxito</p>
              </section>
            </div>
          )}

          {/* Guía */}
          {status === BuildStatus.IDLE && (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-500/5 rounded-3xl p-6 border border-indigo-500/20">
                <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Cómo funciona
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Pega el link de tu repositorio y sube una imagen para el icono. 
                  RepoForge clonará tu proyecto Android, analizará el framework con Gemini IA 
                  y compilará un binario APK firmado listo para instalar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto pt-12 pb-6 text-slate-500 text-xs w-full text-center">
        <p>© 2024 RepoForge Cloud Systems. Todos los procesos son efímeros. Análisis con Google Gemini IA.</p>
      </footer>
    </div>
  );
}
