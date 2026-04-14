/**
 * Centralized project status definitions
 * All status labels, colors, and types are defined here to avoid duplication
 */

// Define the status type
export type StatutProjet = 
  | 'planifie'              // Non-lancé / Planifié
  | 'en_cours'              // En cours
  | 'en_pause'              // En pause / À l'arrêt
  | 'en_retard'             // En retard
  | 'termine'               // Achevé
  | 'en_cours_resilition'   // En cours de résiliation
  | 'resilie'               // Résilié
  | 'en_procedure';         // En procédure

/**
 * Status configuration: each status has a value, label, and color
 */
export const STATUS_CONFIG: Array<{
  value: StatutProjet;
  label: string;
  color: string;
}> = [
  {
    value: 'planifie',
    label: 'Non-lancé',
    color: 'bg-gray-100 text-gray-800',
  },
  {
    value: 'en_cours',
    label: 'En cours',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'en_pause',
    label: 'À l\'arrêt',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'en_retard',
    label: 'En retard',
    color: 'bg-red-100 text-red-800',
  },
  {
    value: 'termine',
    label: 'Achevé',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'en_cours_resilition',
    label: 'En cours de résiliation',
    color: 'bg-slate-100 text-slate-800',
  },
  {
    value: 'resilie',
    label: 'Résilié',
    color: 'bg-slate-200 text-slate-900',
  },
  {
    value: 'en_procedure',
    label: 'En procédure',
    color: 'bg-amber-100 text-amber-800',
  },
];

/**
 * Helper function to get the label for a status
 */
export function getStatusLabel(status: string): string {
  const config = STATUS_CONFIG.find(s => s.value === status);
  return config?.label || status;
}

/**
 * Helper function to get the color classes for a status
 */
export function getStatusColor(status: string): string {
  const config = STATUS_CONFIG.find(s => s.value === status);
  return config?.color || 'bg-gray-100 text-gray-800';
}

/**
 * Array of statuses for filter dropdowns (includes 'tous')
 */
export const STATUS_FILTER_OPTIONS: Array<{
  value: StatutProjet | 'tous';
  label: string;
}> = [
  { value: 'tous', label: 'Tous les statuts' },
  ...STATUS_CONFIG.map(s => ({ value: s.value, label: s.label })),
];
