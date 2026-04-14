import { z } from 'zod';
import type { Projet } from '../types/index';
import { STATUS_CONFIG } from '../constants/statuses';

// Storage configuration
const STORAGE_KEY = 'app_projects_data';
const STORAGE_VERSION = 1;

// Zod schema for validating exported/imported data
const ReferenceDocSchema = z.object({
  numero: z.string(),
  date: z.string(),
});

const VisaInfoSchema = z.object({
  numero: z.string(),
  date: z.string(),
  rapportReserves: z.string().optional(),
});

const OdsSchema = z.object({
  numero: z.string(),
  date: z.string(),
});

const ContrainteSchema = z.object({
  description: z.string(),
  mesuresPrises: z.string(),
});

const ProjetSchema = z.object({
  id: z.string(),
  exercice: z.number(),
  programme: z.string(),
  operation: z.string().optional(),
  cocontractant: z.string().optional(),
  
  referenceDemande: ReferenceDocSchema,
  referenceNotification: ReferenceDocSchema,
  
  cahierDesCharges: z.object({
    expressionBesoins: z.boolean(),
    dossierTerrain: z.boolean(),
    cps: z.boolean(),
    ccag: z.boolean(),
    rapportPresentation: z.boolean(),
  }),
  
  lancement: z.object({
    transmissionVisaCC: ReferenceDocSchema,
    visaSousReserves: VisaInfoSchema.optional(),
    visaSansReserves: VisaInfoSchema.optional(),
    transmissionPublication: ReferenceDocSchema,
    publication: ReferenceDocSchema,
    dureePublication: z.number(),
    delaiRestantExpiration: z.number(),
    dateCopeo: z.string(),
  }),
  
  contrat: z.object({
    transmissionProjetContrat: ReferenceDocSchema,
    visaSousReserves: VisaInfoSchema.optional(),
    visaSansReserves: VisaInfoSchema.optional(),
    dossierEngagement: ReferenceDocSchema,
    montantEngage: z.number(),
    cocontractant: z.string().optional(),
  }),
  
  travaux: z.object({
    ods: OdsSchema,
    notificationOds: z.string(),
    pvInstallation: ReferenceDocSchema,
    delaisRealisation: z.number(),
    dateEffetCommencement: z.string(),
    avancementAncien: z.number(),
    avancementNouveau: z.number(),
  }),
  
  paiement: z.object({
    pourcentageCumulPaiement: z.number(),
    cumulPaiement: z.number(),
    paiementEnInstance: z.number(),
    montantAvanceForfaitaire: z.number(),
    restitutionAvanceForfaitaire: z.number(),
    montantAvanceApprovisionnement: z.number(),
    restitutionAvanceApprovisionnement: z.number(),
    tauxRestitutionAvances: z.number(),
  }),
  
  contraintes: z.array(ContrainteSchema),
  observations: z.string(),
  statut: z.enum(STATUS_CONFIG.map(s => s.value)),
  
  dateCreation: z.string(),
  dateModification: z.string(),
});

// Storage data structure with metadata
const StorageDataSchema = z.object({
  version: z.number(),
  timestamp: z.string(),
  projects: z.array(ProjetSchema),
});

export type StorageData = z.infer<typeof StorageDataSchema>;

/**
 * Save projects to localStorage
 */
export function saveProjectsToStorage(projects: Projet[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      projects,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save projects to storage:', error);
  }
}

/**
 * Load projects from localStorage
 */
export function loadProjectsFromStorage(): Projet[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const data = StorageDataSchema.parse(parsed);
    
    return data.projects as Projet[];
  } catch (error) {
    console.error('Failed to load projects from storage:', error);
    return null;
  }
}

/**
 * Check if there is persisted data in localStorage
 */
export function hasPersistedData(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all stored projects
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Export projects to JSON file
 */
export function exportProjectsToJSON(projects: Projet[], filename = 'projects_backup.json'): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      projects: projects as unknown as StorageData['projects'],
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export projects:', error);
    throw new Error('Failed to export projects to JSON');
  }
}

/**
 * Import projects from JSON file
 * Returns { success: true, projects: [...] } or { success: false, errors: [...] }
 */
export async function importProjectsFromJSON(
  file: File
): Promise<{ success: boolean; projects?: Projet[]; errors?: string[] }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Validate version
    if (parsed.version && parsed.version !== STORAGE_VERSION) {
      console.warn(`Data version mismatch: file version ${parsed.version}, current ${STORAGE_VERSION}`);
    }
    
    // Validate data structure
    const data = StorageDataSchema.parse(parsed);
    
    return {
      success: true,
      projects: data.projects as Projet[],
    };
  } catch (error) {
    let errorMessage = 'Import failed';
    
    if (error instanceof z.ZodError) {
      errorMessage = `Validation error: ${error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')}`;
    } else if (error instanceof SyntaxError) {
      errorMessage = `Invalid JSON: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      errors: [errorMessage],
    };
  }
}

/**
 * Export projects to CSV format
 * Basic export of key fields for quick backup/review
 */
export function exportProjectsToCSV(projects: Projet[], filename = 'projects_backup.csv'): void {
  try {
    const headers = [
      'ID',
      'Exercice',
      'Programme',
      'Opération',
      'Co-contractant',
      'Statut',
      'Date Création',
      'Date Modification',
    ];
    
    const rows = projects.map(p => [
      p.id,
      p.exercice,
      p.programme,
      p.operation || '',
      p.cocontractant || '',
      p.statut,
      p.dateCreation,
      p.dateModification,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export projects to CSV:', error);
    throw new Error('Failed to export projects to CSV');
  }
}
