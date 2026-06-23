export type EstiloResumen = 'devocional' | 'estudio';

export interface Versiculo {
  id: string;
  referencia: string;
}

export interface Resumen {
  estilo: EstiloResumen;
  ideaCentral: string;
  puntosPrincipales: string[];
  versiculosClave: string[];
  aplicacion: string;
  generadoEn: string; // ISO date
}

export interface Nota {
  id: string;
  fecha: string; // YYYY-MM-DD
  iglesia: string;
  predicador: string;
  tema: string;
  contenido: string;
  versiculos: Versiculo[];
  resumen: Resumen | null;
  destacada?: boolean;
  creadoEn: string; // ISO date
  actualizadoEn: string; // ISO date
}

export interface Configuracion {
  apiKey: string;
  geminiApiKey?: string;
  githubToken?: string;
  gistId?: string;
  githubUsername?: string;
}

export interface FeNotesData {
  notas: Nota[];
  configuracion: Configuracion;
  ultimaIglesia: string;
  predicadoresUsados: string[];
}
