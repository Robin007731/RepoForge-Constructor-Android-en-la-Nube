
export enum BuildStatus {
  IDLE = 'ESPERA',
  CLONING = 'CLONANDO',
  ANALYZING = 'ANALIZANDO',
  BUILDING = 'CONSTRUYENDO',
  SIGNING = 'FIRMANDO',
  COMPLETED = 'COMPLETADO',
  FAILED = 'FALLIDO'
}

export interface BuildStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface BuildLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface RepoAnalysis {
  projectName: string;
  detectedFramework: string;
  dependencies: string[];
  estimatedSize: string;
  buildComplexity: 'Baja' | 'Media' | 'Alta';
}
