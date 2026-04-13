// Types pour la gestion des projets d'infrastructure

export interface ReferenceDoc {
  numero: string;
  date: string;
}

export interface VisaInfo {
  numero: string;
  date: string;
  rapportReserves?: string;
}

export interface CahierDesCharges {
  expressionBesoins: boolean;
  dossierTerrain: boolean;
  cps: boolean;
  ccag: boolean;
  rapportPresentation: boolean;
}

export interface LancementProcedure {
  transmissionVisaCC: ReferenceDoc;
  visaSousReserves?: VisaInfo;
  visaSansReserves?: VisaInfo;
  transmissionPublication: ReferenceDoc;
  publication: ReferenceDoc;
  dureePublication: number;
  delaiRestantExpiration: number;
  dateCopeo: string;
}

export interface Contrat {
  transmissionProjetContrat: ReferenceDoc;
  visaSousReserves?: VisaInfo;
  visaSansReserves?: VisaInfo;
  dossierEngagement: ReferenceDoc;
  montantEngage: number;
  cocontractant?: string;
}

export interface ODS {
  numero: string;
  date: string;
}

export interface Travaux {
  ods: ODS;
  notificationOds: string;
  pvInstallation: ReferenceDoc;
  delaisRealisation: number;
  dateEffetCommencement: string;
  avancementAncien: number;
  avancementNouveau: number;
}

export interface Paiement {
  pourcentageCumulPaiement: number;
  cumulPaiement: number;
  paiementEnInstance: number;
  montantAvanceForfaitaire: number;
  restitutionAvanceForfaitaire: number;
  montantAvanceApprovisionnement: number;
  restitutionAvanceApprovisionnement: number;
  tauxRestitutionAvances: number;
}

export interface Contrainte {
  description: string;
  mesuresPrises: string;
}

// Statuts étendus pour le suivi détaillé
export type StatutProjet = 
  | 'planifie'           // Planifié
  | 'en_cours'           // En cours
  | 'en_pause'           // En pause / À l'arrêt
  | 'en_retard'          // En retard
  | 'termine'            // Achevé
  | 'annule';            // Annulé

export interface Projet {
  id: string;
  exercice: number;
  programme: string;
  operation?: string;           // Nom de l'opération
  cocontractant?: string;       // Nom du cocontractant
  referenceDemande: ReferenceDoc;
  referenceNotification: ReferenceDoc;
  cahierDesCharges: CahierDesCharges;
  lancement: LancementProcedure;
  contrat: Contrat;
  travaux: Travaux;
  paiement: Paiement;
  contraintes: Contrainte[];
  observations: string;
  statut: StatutProjet;
  dateCreation: string;
  dateModification: string;
}

export interface Alert {
  id: string;
  projetId: string;
  type: 'delai' | 'avance' | 'avancement' | 'publication';
  message: string;
  niveau: 'critique' | 'warning' | 'info';
  dateCreation: string;
  lue: boolean;
}

export interface DashboardStats {
  totalProjets: number;
  projetsEnCours: number;
  projetsTermines: number;
  montantTotalEngage: number;
  montantTotalPaye: number;
  alertesCritiques: number;
  alertesWarning: number;
  // Nouveaux compteurs
  projetsEnRetard: number;
  projetsEnPause: number;
  projetsPlanifies: number;
}

export interface FiltresProjet {
  exercice?: number;
  statut?: string;
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  cocontractant?: string;
  operation?: string;
}

export interface FiltresEtatSortie {
  planAnnuel?: number;          // Filtrer par exercice/année
  operation?: string;           // Filtrer par opération
  cocontractant?: string;       // Filtrer par cocontractant
  statut?: StatutProjet | 'tous';  // Filtrer par statut
}
