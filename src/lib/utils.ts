import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'planifie': 'Planifié',
    'en_cours': 'En cours',
    'en_pause': 'À l\'arrêt',
    'en_retard': 'En retard',
    'termine': 'Achevé',
    'annule': 'Annulé',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'planifie': 'bg-gray-100 text-gray-800',
    'en_cours': 'bg-blue-100 text-blue-800',
    'en_pause': 'bg-orange-100 text-orange-800',
    'en_retard': 'bg-red-100 text-red-800',
    'termine': 'bg-green-100 text-green-800',
    'annule': 'bg-slate-100 text-slate-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
