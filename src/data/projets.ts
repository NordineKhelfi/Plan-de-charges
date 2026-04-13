import type { Projet, Alert, DashboardStats, StatutProjet } from '@/types';
import { loadProjectsFromStorage } from '@/lib/storage';

// Données de démonstration - Projets depuis 2009 avec opérations et cocontractants
const demoProjects: Projet[] = [
  // Exercice 2025
  {
    id: '1',
    exercice: 2025,
    programme: 'Travaux de réalisation d\'un abri véhicule',
    operation: 'Sécurisation du parc automobile',
    cocontractant: 'ENTREPRISE GÉNÉRALE DU BTP',
    referenceDemande: { numero: '15', date: '2025-09-15' },
    referenceNotification: { numero: '16', date: '2026-02-15' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '19', date: '2026-06-15' },
      visaSansReserves: { numero: '21', date: '2026-07-25' },
      transmissionPublication: { numero: '22', date: '2026-08-15' },
      publication: { numero: '23', date: '2026-08-20' },
      dureePublication: 30,
      delaiRestantExpiration: 5,
      dateCopeo: '2026-09-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '21', date: '2026-09-25' },
      visaSansReserves: { numero: '25', date: '2026-10-19' },
      dossierEngagement: { numero: '26', date: '2026-10-30' },
      montantEngage: 15000000,
      cocontractant: 'ENTREPRISE GÉNÉRALE DU BTP',
    },
    travaux: {
      ods: { numero: '27', date: '2026-11-30' },
      notificationOds: '2026-12-15',
      pvInstallation: { numero: '28', date: '2026-12-01' },
      delaisRealisation: 180,
      dateEffetCommencement: '2026-12-15',
      avancementAncien: 0.15,
      avancementNouveau: 0.20,
    },
    paiement: {
      pourcentageCumulPaiement: 0.05,
      cumulPaiement: 750000,
      paiementEnInstance: 100000,
      montantAvanceForfaitaire: 2250000,
      restitutionAvanceForfaitaire: 150000,
      montantAvanceApprovisionnement: 0,
      restitutionAvanceApprovisionnement: 0,
      tauxRestitutionAvances: 0.067,
    },
    contraintes: [
      { description: 'Retard livraison matériaux', mesuresPrises: 'Relance fournisseur' },
    ],
    observations: 'Projet prioritaire pour la sécurité du parc automobile',
    statut: 'en_cours',
    dateCreation: '2025-09-15',
    dateModification: '2026-12-01',
  },
  // Exercice 2024 - En retard
  {
    id: '2',
    exercice: 2024,
    programme: 'Construction d\'un bâtiment administratif',
    operation: 'Modernisation des infrastructures administratives',
    cocontractant: 'CONSTRUCTION MODERNE SA',
    referenceDemande: { numero: '42', date: '2024-03-10' },
    referenceNotification: { numero: '45', date: '2024-06-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '50', date: '2024-08-15' },
      visaSansReserves: { numero: '52', date: '2024-09-10' },
      transmissionPublication: { numero: '55', date: '2024-09-25' },
      publication: { numero: '58', date: '2024-10-01' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2024-11-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '60', date: '2024-11-20' },
      visaSansReserves: { numero: '62', date: '2024-12-05' },
      dossierEngagement: { numero: '65', date: '2024-12-20' },
      montantEngage: 85000000,
      cocontractant: 'CONSTRUCTION MODERNE SA',
    },
    travaux: {
      ods: { numero: '70', date: '2025-01-15' },
      notificationOds: '2025-01-20',
      pvInstallation: { numero: '72', date: '2025-01-18' },
      delaisRealisation: 365,
      dateEffetCommencement: '2025-01-20',
      avancementAncien: 0.65,
      avancementNouveau: 0.72,
    },
    paiement: {
      pourcentageCumulPaiement: 0.45,
      cumulPaiement: 38250000,
      paiementEnInstance: 5000000,
      montantAvanceForfaitaire: 12750000,
      restitutionAvanceForfaitaire: 5000000,
      montantAvanceApprovisionnement: 2000000,
      restitutionAvanceApprovisionnement: 500000,
      tauxRestitutionAvances: 0.41,
    },
    contraintes: [
      { description: 'Retard de paiement des travaux', mesuresPrises: 'Programmation des décaissements' },
    ],
    observations: 'Avancement en retard de 2 mois',
    statut: 'en_retard',
    dateCreation: '2024-03-10',
    dateModification: '2025-12-01',
  },
  // Exercice 2023 - Projet terminé
  {
    id: '3',
    exercice: 2023,
    programme: 'Réhabilitation du réseau d\'eau potable',
    operation: 'Amélioration des services publics',
    cocontractant: 'HYDRAULIQUE ET ASSAINISSEMENT',
    referenceDemande: { numero: '101', date: '2023-01-15' },
    referenceNotification: { numero: '105', date: '2023-04-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '110', date: '2023-06-10' },
      visaSansReserves: { numero: '112', date: '2023-07-05' },
      transmissionPublication: { numero: '115', date: '2023-07-20' },
      publication: { numero: '118', date: '2023-08-01' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2023-09-01',
    },
    contrat: {
      transmissionProjetContrat: { numero: '120', date: '2023-09-15' },
      visaSansReserves: { numero: '122', date: '2023-09-30' },
      dossierEngagement: { numero: '125', date: '2023-10-10' },
      montantEngage: 45000000,
      cocontractant: 'HYDRAULIQUE ET ASSAINISSEMENT',
    },
    travaux: {
      ods: { numero: '130', date: '2023-11-01' },
      notificationOds: '2023-11-05',
      pvInstallation: { numero: '132', date: '2023-11-03' },
      delaisRealisation: 240,
      dateEffetCommencement: '2023-11-05',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 45000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 6750000,
      restitutionAvanceForfaitaire: 6750000,
      montantAvanceApprovisionnement: 1500000,
      restitutionAvanceApprovisionnement: 1500000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Projet réceptionné sans réserve le 15/07/2024',
    statut: 'termine',
    dateCreation: '2023-01-15',
    dateModification: '2024-07-15',
  },
  // Exercice 2022 - Terminé
  {
    id: '4',
    exercice: 2022,
    programme: 'Construction d\'une crèche municipale',
    operation: 'Développement des infrastructures sociales',
    cocontractant: 'BÂTIMENT SCOLAIRE ET SOCIAL',
    referenceDemande: { numero: '201', date: '2022-02-10' },
    referenceNotification: { numero: '205', date: '2022-05-15' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '210', date: '2022-07-01' },
      visaSousReserves: { numero: '212', date: '2022-07-20', rapportReserves: 'Modifications CPS requises' },
      visaSansReserves: { numero: '215', date: '2022-08-10' },
      transmissionPublication: { numero: '218', date: '2022-08-25' },
      publication: { numero: '220', date: '2022-09-01' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2022-10-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '225', date: '2022-11-01' },
      visaSansReserves: { numero: '228', date: '2022-11-20' },
      dossierEngagement: { numero: '230', date: '2022-12-01' },
      montantEngage: 32000000,
      cocontractant: 'BÂTIMENT SCOLAIRE ET SOCIAL',
    },
    travaux: {
      ods: { numero: '235', date: '2023-01-10' },
      notificationOds: '2023-01-15',
      pvInstallation: { numero: '238', date: '2023-01-12' },
      delaisRealisation: 300,
      dateEffetCommencement: '2023-01-15',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 32000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 4800000,
      restitutionAvanceForfaitaire: 4800000,
      montantAvanceApprovisionnement: 1000000,
      restitutionAvanceApprovisionnement: 1000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Réception définitive obtenue',
    statut: 'termine',
    dateCreation: '2022-02-10',
    dateModification: '2023-11-15',
  },
  // Exercice 2021 - En pause
  {
    id: '5',
    exercice: 2021,
    programme: 'Aménagement d\'une zone industrielle',
    operation: 'Développement économique territorial',
    cocontractant: 'AMÉNAGEMENT ET TERRASSEMENT',
    referenceDemande: { numero: '301', date: '2021-03-20' },
    referenceNotification: { numero: '305', date: '2021-07-10' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '310', date: '2021-09-01' },
      visaSansReserves: { numero: '312', date: '2021-09-20' },
      transmissionPublication: { numero: '315', date: '2021-10-05' },
      publication: { numero: '318', date: '2021-10-15' },
      dureePublication: 60,
      delaiRestantExpiration: 0,
      dateCopeo: '2021-12-01',
    },
    contrat: {
      transmissionProjetContrat: { numero: '320', date: '2021-12-15' },
      visaSansReserves: { numero: '322', date: '2022-01-10' },
      dossierEngagement: { numero: '325', date: '2022-01-25' },
      montantEngage: 120000000,
      cocontractant: 'AMÉNAGEMENT ET TERRASSEMENT',
    },
    travaux: {
      ods: { numero: '330', date: '2022-03-01' },
      notificationOds: '2022-03-05',
      pvInstallation: { numero: '332', date: '2022-03-03' },
      delaisRealisation: 540,
      dateEffetCommencement: '2022-03-05',
      avancementAncien: 0.45,
      avancementNouveau: 0.45,
    },
    paiement: {
      pourcentageCumulPaiement: 0.35,
      cumulPaiement: 42000000,
      paiementEnInstance: 15000000,
      montantAvanceForfaitaire: 18000000,
      restitutionAvanceForfaitaire: 5000000,
      montantAvanceApprovisionnement: 5000000,
      restitutionAvanceApprovisionnement: 1000000,
      tauxRestitutionAvances: 0.26,
    },
    contraintes: [
      { description: 'Problèmes de décaissement', mesuresPrises: 'Réunion avec la DAF' },
      { description: 'Arrêt des travaux pour révision du financement', mesuresPrises: 'En attente de validation budgétaire' },
    ],
    observations: 'Projet mis en pause pour révision du financement',
    statut: 'en_pause',
    dateCreation: '2021-03-20',
    dateModification: '2024-12-01',
  },
  // Exercice 2020 - Terminé
  {
    id: '6',
    exercice: 2020,
    programme: 'Réfection de la voirie principale',
    operation: 'Entretien des infrastructures routières',
    cocontractant: 'ROUTE ET VOIRIE',
    referenceDemande: { numero: '401', date: '2020-01-10' },
    referenceNotification: { numero: '405', date: '2020-04-15' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '410', date: '2020-06-01' },
      visaSansReserves: { numero: '412', date: '2020-06-20' },
      transmissionPublication: { numero: '415', date: '2020-07-05' },
      publication: { numero: '418', date: '2020-07-15' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2020-08-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '420', date: '2020-09-01' },
      visaSansReserves: { numero: '422', date: '2020-09-15' },
      dossierEngagement: { numero: '425', date: '2020-10-01' },
      montantEngage: 25000000,
      cocontractant: 'ROUTE ET VOIRIE',
    },
    travaux: {
      ods: { numero: '430', date: '2020-11-01' },
      notificationOds: '2020-11-05',
      pvInstallation: { numero: '432', date: '2020-11-03' },
      delaisRealisation: 180,
      dateEffetCommencement: '2020-11-05',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 25000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 3750000,
      restitutionAvanceForfaitaire: 3750000,
      montantAvanceApprovisionnement: 0,
      restitutionAvanceApprovisionnement: 0,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Projet terminé dans les délais malgré la pandémie',
    statut: 'termine',
    dateCreation: '2020-01-10',
    dateModification: '2021-06-01',
  },
  // Exercice 2019 - Terminé
  {
    id: '7',
    exercice: 2019,
    programme: 'Construction d\'un marché couvert',
    operation: 'Développement du commerce local',
    cocontractant: 'CONSTRUCTION COMMERCIALE',
    referenceDemande: { numero: '501', date: '2019-02-15' },
    referenceNotification: { numero: '505', date: '2019-05-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '510', date: '2019-07-10' },
      visaSansReserves: { numero: '512', date: '2019-08-01' },
      transmissionPublication: { numero: '515', date: '2019-08-20' },
      publication: { numero: '518', date: '2019-09-01' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2019-11-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '520', date: '2019-11-25' },
      visaSansReserves: { numero: '522', date: '2019-12-15' },
      dossierEngagement: { numero: '525', date: '2020-01-05' },
      montantEngage: 55000000,
      cocontractant: 'CONSTRUCTION COMMERCIALE',
    },
    travaux: {
      ods: { numero: '530', date: '2020-01-20' },
      notificationOds: '2020-01-25',
      pvInstallation: { numero: '532', date: '2020-01-22' },
      delaisRealisation: 365,
      dateEffetCommencement: '2020-01-25',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 55000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 8250000,
      restitutionAvanceForfaitaire: 8250000,
      montantAvanceApprovisionnement: 2000000,
      restitutionAvanceApprovisionnement: 2000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Marché inauguré le 15/02/2021',
    statut: 'termine',
    dateCreation: '2019-02-15',
    dateModification: '2021-02-15',
  },
  // Exercice 2018 - Terminé
  {
    id: '8',
    exercice: 2018,
    programme: 'Extension du réseau électrique',
    operation: 'Électrification rurale',
    cocontractant: 'ÉNERGIE ET ÉLECTRICITÉ',
    referenceDemande: { numero: '601', date: '2018-03-01' },
    referenceNotification: { numero: '605', date: '2018-06-15' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '610', date: '2018-08-01' },
      visaSansReserves: { numero: '612', date: '2018-08-25' },
      transmissionPublication: { numero: '615', date: '2018-09-10' },
      publication: { numero: '618', date: '2018-09-20' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2018-10-25',
    },
    contrat: {
      transmissionProjetContrat: { numero: '620', date: '2018-11-10' },
      visaSansReserves: { numero: '622', date: '2018-11-30' },
      dossierEngagement: { numero: '625', date: '2018-12-15' },
      montantEngage: 18000000,
      cocontractant: 'ÉNERGIE ET ÉLECTRICITÉ',
    },
    travaux: {
      ods: { numero: '630', date: '2019-01-10' },
      notificationOds: '2019-01-15',
      pvInstallation: { numero: '632', date: '2019-01-12' },
      delaisRealisation: 240,
      dateEffetCommencement: '2019-01-15',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 18000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 2700000,
      restitutionAvanceForfaitaire: 2700000,
      montantAvanceApprovisionnement: 500000,
      restitutionAvanceApprovisionnement: 500000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Extension terminée avec succès',
    statut: 'termine',
    dateCreation: '2018-03-01',
    dateModification: '2019-10-01',
  },
  // Exercice 2017 - Terminé
  {
    id: '9',
    exercice: 2017,
    programme: 'Rénovation du centre de santé',
    operation: 'Amélioration des services de santé',
    cocontractant: 'SANTÉ ET BÂTIMENT',
    referenceDemande: { numero: '701', date: '2017-01-20' },
    referenceNotification: { numero: '705', date: '2017-04-30' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '710', date: '2017-06-15' },
      visaSansReserves: { numero: '712', date: '2017-07-10' },
      transmissionPublication: { numero: '715', date: '2017-07-25' },
      publication: { numero: '718', date: '2017-08-05' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2017-09-10',
    },
    contrat: {
      transmissionProjetContrat: { numero: '720', date: '2017-09-25' },
      visaSansReserves: { numero: '722', date: '2017-10-15' },
      dossierEngagement: { numero: '725', date: '2017-11-01' },
      montantEngage: 28000000,
      cocontractant: 'SANTÉ ET BÂTIMENT',
    },
    travaux: {
      ods: { numero: '730', date: '2017-12-10' },
      notificationOds: '2017-12-15',
      pvInstallation: { numero: '732', date: '2017-12-12' },
      delaisRealisation: 270,
      dateEffetCommencement: '2017-12-15',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 28000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 4200000,
      restitutionAvanceForfaitaire: 4200000,
      montantAvanceApprovisionnement: 1000000,
      restitutionAvanceApprovisionnement: 1000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Centre rénové et opérationnel',
    statut: 'termine',
    dateCreation: '2017-01-20',
    dateModification: '2018-10-01',
  },
  // Exercice 2016 - Terminé
  {
    id: '10',
    exercice: 2016,
    programme: 'Construction d\'une école primaire',
    operation: 'Développement de l\'éducation',
    cocontractant: 'BÂTIMENT SCOLAIRE ET SOCIAL',
    referenceDemande: { numero: '801', date: '2016-02-10' },
    referenceNotification: { numero: '805', date: '2016-05-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '810', date: '2016-07-15' },
      visaSansReserves: { numero: '812', date: '2016-08-10' },
      transmissionPublication: { numero: '815', date: '2016-08-25' },
      publication: { numero: '818', date: '2016-09-05' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2016-10-20',
    },
    contrat: {
      transmissionProjetContrat: { numero: '820', date: '2016-11-10' },
      visaSansReserves: { numero: '822', date: '2016-11-30' },
      dossierEngagement: { numero: '825', date: '2016-12-15' },
      montantEngage: 42000000,
      cocontractant: 'BÂTIMENT SCOLAIRE ET SOCIAL',
    },
    travaux: {
      ods: { numero: '830', date: '2017-01-20' },
      notificationOds: '2017-01-25',
      pvInstallation: { numero: '832', date: '2017-01-22' },
      delaisRealisation: 330,
      dateEffetCommencement: '2017-01-25',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 42000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 6300000,
      restitutionAvanceForfaitaire: 6300000,
      montantAvanceApprovisionnement: 1500000,
      restitutionAvanceApprovisionnement: 1500000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'École inaugurée à la rentrée 2018',
    statut: 'termine',
    dateCreation: '2016-02-10',
    dateModification: '2018-01-10',
  },
  // Exercice 2015 - Terminé
  {
    id: '11',
    exercice: 2015,
    programme: 'Aménagement d\'un parc public',
    operation: 'Développement des espaces verts',
    cocontractant: 'ESPACES VERTS ET AMÉNAGEMENT',
    referenceDemande: { numero: '901', date: '2015-03-15' },
    referenceNotification: { numero: '905', date: '2015-06-30' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '910', date: '2015-08-15' },
      visaSansReserves: { numero: '912', date: '2015-09-10' },
      transmissionPublication: { numero: '915', date: '2015-09-25' },
      publication: { numero: '918', date: '2015-10-05' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2015-11-10',
    },
    contrat: {
      transmissionProjetContrat: { numero: '920', date: '2015-11-25' },
      visaSansReserves: { numero: '922', date: '2015-12-15' },
      dossierEngagement: { numero: '925', date: '2016-01-05' },
      montantEngage: 15000000,
      cocontractant: 'ESPACES VERTS ET AMÉNAGEMENT',
    },
    travaux: {
      ods: { numero: '930', date: '2016-02-15' },
      notificationOds: '2016-02-20',
      pvInstallation: { numero: '932', date: '2016-02-18' },
      delaisRealisation: 180,
      dateEffetCommencement: '2016-02-20',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 15000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 2250000,
      restitutionAvanceForfaitaire: 2250000,
      montantAvanceApprovisionnement: 0,
      restitutionAvanceApprovisionnement: 0,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Parc ouvert au public',
    statut: 'termine',
    dateCreation: '2015-03-15',
    dateModification: '2016-09-01',
  },
  // Exercice 2014 - Terminé
  {
    id: '12',
    exercice: 2014,
    programme: 'Réhabilitation d\'un bâtiment historique',
    operation: 'Préservation du patrimoine',
    cocontractant: 'PATRIMOINE ET RÉNOVATION',
    referenceDemande: { numero: '1001', date: '2014-01-10' },
    referenceNotification: { numero: '1005', date: '2014-04-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1010', date: '2014-06-10' },
      visaSousReserves: { numero: '1012', date: '2014-07-01', rapportReserves: 'Préciser les normes de réhabilitation' },
      visaSansReserves: { numero: '1015', date: '2014-07-25' },
      transmissionPublication: { numero: '1018', date: '2014-08-10' },
      publication: { numero: '1020', date: '2014-08-20' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2014-10-05',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1025', date: '2014-10-25' },
      visaSansReserves: { numero: '1028', date: '2014-11-15' },
      dossierEngagement: { numero: '1030', date: '2014-12-01' },
      montantEngage: 38000000,
      cocontractant: 'PATRIMOINE ET RÉNOVATION',
    },
    travaux: {
      ods: { numero: '1035', date: '2015-01-15' },
      notificationOds: '2015-01-20',
      pvInstallation: { numero: '1038', date: '2015-01-18' },
      delaisRealisation: 365,
      dateEffetCommencement: '2015-01-20',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 38000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 5700000,
      restitutionAvanceForfaitaire: 5700000,
      montantAvanceApprovisionnement: 1500000,
      restitutionAvanceApprovisionnement: 1500000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Bâtiment classé monument historique réhabilité',
    statut: 'termine',
    dateCreation: '2014-01-10',
    dateModification: '2016-02-01',
  },
  // Exercice 2013 - Terminé
  {
    id: '13',
    exercice: 2013,
    programme: 'Construction d\'un stade municipal',
    operation: 'Développement des infrastructures sportives',
    cocontractant: 'SPORT ET LOISIRS',
    referenceDemande: { numero: '1101', date: '2013-02-20' },
    referenceNotification: { numero: '1105', date: '2013-05-30' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1110', date: '2013-07-20' },
      visaSansReserves: { numero: '1112', date: '2013-08-15' },
      transmissionPublication: { numero: '1115', date: '2013-09-01' },
      publication: { numero: '1118', date: '2013-09-10' },
      dureePublication: 60,
      delaiRestantExpiration: 0,
      dateCopeo: '2013-11-10',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1120', date: '2013-11-25' },
      visaSansReserves: { numero: '1122', date: '2013-12-15' },
      dossierEngagement: { numero: '1125', date: '2014-01-05' },
      montantEngage: 95000000,
      cocontractant: 'SPORT ET LOISIRS',
    },
    travaux: {
      ods: { numero: '1130', date: '2014-02-20' },
      notificationOds: '2014-02-25',
      pvInstallation: { numero: '1132', date: '2014-02-22' },
      delaisRealisation: 450,
      dateEffetCommencement: '2014-02-25',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 95000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 14250000,
      restitutionAvanceForfaitaire: 14250000,
      montantAvanceApprovisionnement: 3000000,
      restitutionAvanceApprovisionnement: 3000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Stade inauguré avec succès',
    statut: 'termine',
    dateCreation: '2013-02-20',
    dateModification: '2015-06-01',
  },
  // Exercice 2012 - Terminé
  {
    id: '14',
    exercice: 2012,
    programme: 'Extension du réseau d\'assainissement',
    operation: 'Amélioration de l\'assainissement',
    cocontractant: 'HYDRAULIQUE ET ASSAINISSEMENT',
    referenceDemande: { numero: '1201', date: '2012-03-10' },
    referenceNotification: { numero: '1205', date: '2012-06-20' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1210', date: '2012-08-10' },
      visaSansReserves: { numero: '1212', date: '2012-09-05' },
      transmissionPublication: { numero: '1215', date: '2012-09-20' },
      publication: { numero: '1218', date: '2012-10-01' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2012-11-05',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1220', date: '2012-11-20' },
      visaSansReserves: { numero: '1222', date: '2012-12-10' },
      dossierEngagement: { numero: '1225', date: '2013-01-05' },
      montantEngage: 22000000,
      cocontractant: 'HYDRAULIQUE ET ASSAINISSEMENT',
    },
    travaux: {
      ods: { numero: '1230', date: '2013-02-10' },
      notificationOds: '2013-02-15',
      pvInstallation: { numero: '1232', date: '2013-02-12' },
      delaisRealisation: 240,
      dateEffetCommencement: '2013-02-15',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 22000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 3300000,
      restitutionAvanceForfaitaire: 3300000,
      montantAvanceApprovisionnement: 500000,
      restitutionAvanceApprovisionnement: 500000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Réseau opérationnel',
    statut: 'termine',
    dateCreation: '2012-03-10',
    dateModification: '2013-11-01',
  },
  // Exercice 2011 - Terminé
  {
    id: '15',
    exercice: 2011,
    programme: 'Construction d\'une bibliothèque municipale',
    operation: 'Développement de la culture',
    cocontractant: 'CULTURE ET PATRIMOINE',
    referenceDemande: { numero: '1301', date: '2011-01-15' },
    referenceNotification: { numero: '1305', date: '2011-04-25' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1310', date: '2011-06-15' },
      visaSansReserves: { numero: '1312', date: '2011-07-10' },
      transmissionPublication: { numero: '1315', date: '2011-07-25' },
      publication: { numero: '1318', date: '2011-08-05' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2011-09-20',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1320', date: '2011-10-10' },
      visaSansReserves: { numero: '1322', date: '2011-10-30' },
      dossierEngagement: { numero: '1325', date: '2011-11-15' },
      montantEngage: 30000000,
      cocontractant: 'CULTURE ET PATRIMOINE',
    },
    travaux: {
      ods: { numero: '1330', date: '2012-01-10' },
      notificationOds: '2012-01-15',
      pvInstallation: { numero: '1332', date: '2012-01-12' },
      delaisRealisation: 300,
      dateEffetCommencement: '2012-01-15',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 30000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 4500000,
      restitutionAvanceForfaitaire: 4500000,
      montantAvanceApprovisionnement: 1000000,
      restitutionAvanceApprovisionnement: 1000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Bibliothèque ouverte au public',
    statut: 'termine',
    dateCreation: '2011-01-15',
    dateModification: '2012-12-01',
  },
  // Exercice 2010 - Terminé
  {
    id: '16',
    exercice: 2010,
    programme: 'Réfection de l\'éclairage public',
    operation: 'Modernisation de l\'éclairage',
    cocontractant: 'ÉNERGIE ET ÉLECTRICITÉ',
    referenceDemande: { numero: '1401', date: '2010-02-20' },
    referenceNotification: { numero: '1405', date: '2010-05-30' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1410', date: '2010-07-15' },
      visaSansReserves: { numero: '1412', date: '2010-08-10' },
      transmissionPublication: { numero: '1415', date: '2010-08-25' },
      publication: { numero: '1418', date: '2010-09-05' },
      dureePublication: 30,
      delaiRestantExpiration: 0,
      dateCopeo: '2010-10-10',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1420', date: '2010-10-25' },
      visaSansReserves: { numero: '1422', date: '2010-11-15' },
      dossierEngagement: { numero: '1425', date: '2010-12-01' },
      montantEngage: 12000000,
      cocontractant: 'ÉNERGIE ET ÉLECTRICITÉ',
    },
    travaux: {
      ods: { numero: '1430', date: '2011-01-15' },
      notificationOds: '2011-01-20',
      pvInstallation: { numero: '1432', date: '2011-01-18' },
      delaisRealisation: 150,
      dateEffetCommencement: '2011-01-20',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 12000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 1800000,
      restitutionAvanceForfaitaire: 1800000,
      montantAvanceApprovisionnement: 0,
      restitutionAvanceApprovisionnement: 0,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Éclairage public modernisé',
    statut: 'termine',
    dateCreation: '2010-02-20',
    dateModification: '2011-07-01',
  },
  // Exercice 2009 - Terminé
  {
    id: '17',
    exercice: 2009,
    programme: 'Construction d\'un centre culturel',
    operation: 'Développement culturel',
    cocontractant: 'CULTURE ET PATRIMOINE',
    referenceDemande: { numero: '1501', date: '2009-03-15' },
    referenceNotification: { numero: '1505', date: '2009-06-25' },
    cahierDesCharges: {
      expressionBesoins: true,
      dossierTerrain: true,
      cps: true,
      ccag: true,
      rapportPresentation: true,
    },
    lancement: {
      transmissionVisaCC: { numero: '1510', date: '2009-08-10' },
      visaSansReserves: { numero: '1512', date: '2009-09-05' },
      transmissionPublication: { numero: '1515', date: '2009-09-20' },
      publication: { numero: '1518', date: '2009-10-01' },
      dureePublication: 45,
      delaiRestantExpiration: 0,
      dateCopeo: '2009-11-15',
    },
    contrat: {
      transmissionProjetContrat: { numero: '1520', date: '2009-12-01' },
      visaSansReserves: { numero: '1522', date: '2009-12-20' },
      dossierEngagement: { numero: '1525', date: '2010-01-10' },
      montantEngage: 48000000,
      cocontractant: 'CULTURE ET PATRIMOINE',
    },
    travaux: {
      ods: { numero: '1530', date: '2010-02-20' },
      notificationOds: '2010-02-25',
      pvInstallation: { numero: '1532', date: '2010-02-22' },
      delaisRealisation: 365,
      dateEffetCommencement: '2010-02-25',
      avancementAncien: 1.0,
      avancementNouveau: 1.0,
    },
    paiement: {
      pourcentageCumulPaiement: 1.0,
      cumulPaiement: 48000000,
      paiementEnInstance: 0,
      montantAvanceForfaitaire: 7200000,
      restitutionAvanceForfaitaire: 7200000,
      montantAvanceApprovisionnement: 2000000,
      restitutionAvanceApprovisionnement: 2000000,
      tauxRestitutionAvances: 1.0,
    },
    contraintes: [],
    observations: 'Centre culturel inauguré',
    statut: 'termine',
    dateCreation: '2009-03-15',
    dateModification: '2011-03-01',
  },
];

// Générer des alertes basées sur les données
export function generateAlerts(projets: Projet[]): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();

  projets.forEach((projet) => {
    // Alerte sur délai de publication expirant
    if (projet.lancement.delaiRestantExpiration > 0 && projet.lancement.delaiRestantExpiration <= 7) {
      alerts.push({
        id: `alert-pub-${projet.id}`,
        projetId: projet.id,
        type: 'publication',
        message: `Délai de publication expirant dans ${projet.lancement.delaiRestantExpiration} jours pour "${projet.programme}"`,
        niveau: projet.lancement.delaiRestantExpiration <= 3 ? 'critique' : 'warning',
        dateCreation: today.toISOString(),
        lue: false,
      });
    }

    // Alerte sur avances non restituées
    if (projet.paiement.tauxRestitutionAvances < 1 && projet.statut === 'termine') {
      alerts.push({
        id: `alert-avance-${projet.id}`,
        projetId: projet.id,
        type: 'avance',
        message: `Avances non totalement restituées pour "${projet.programme}" (taux: ${(projet.paiement.tauxRestitutionAvances * 100).toFixed(1)}%)`,
        niveau: 'critique',
        dateCreation: today.toISOString(),
        lue: false,
      });
    }

    // Alerte sur avancement faible
    if (projet.statut === 'en_cours' && projet.travaux.avancementNouveau < 0.3) {
      alerts.push({
        id: `alert-avance-${projet.id}`,
        projetId: projet.id,
        type: 'avancement',
        message: `Avancement faible pour "${projet.programme}" (${(projet.travaux.avancementNouveau * 100).toFixed(0)}%)`,
        niveau: 'info',
        dateCreation: today.toISOString(),
        lue: false,
      });
    }

    // Alerte projet en retard
    if (projet.statut === 'en_retard') {
      alerts.push({
        id: `alert-retard-${projet.id}`,
        projetId: projet.id,
        type: 'avancement',
        message: `Projet "${projet.programme}" en retard`,
        niveau: 'critique',
        dateCreation: today.toISOString(),
        lue: false,
      });
    }

    // Alerte projet en pause
    if (projet.statut === 'en_pause') {
      alerts.push({
        id: `alert-pause-${projet.id}`,
        projetId: projet.id,
        type: 'avancement',
        message: `Projet "${projet.programme}" à l'arrêt`,
        niveau: 'warning',
        dateCreation: today.toISOString(),
        lue: false,
      });
    }
  });

  return alerts;
}

// Calculer les statistiques du tableau de bord
export function calculateStats(projets: Projet[]): DashboardStats {
  const totalProjets = projets.length;
  const projetsEnCours = projets.filter((p) => p.statut === 'en_cours').length;
  const projetsTermines = projets.filter((p) => p.statut === 'termine').length;
  const projetsEnRetard = projets.filter((p) => p.statut === 'en_retard').length;
  const projetsEnPause = projets.filter((p) => p.statut === 'en_pause').length;
  const projetsPlanifies = projets.filter((p) => p.statut === 'planifie').length;
  const montantTotalEngage = projets.reduce((sum, p) => sum + p.contrat.montantEngage, 0);
  const montantTotalPaye = projets.reduce((sum, p) => sum + p.paiement.cumulPaiement, 0);

  const alerts = generateAlerts(projets);
  const alertesCritiques = alerts.filter((a) => a.niveau === 'critique').length;
  const alertesWarning = alerts.filter((a) => a.niveau === 'warning').length;

  return {
    totalProjets,
    projetsEnCours,
    projetsTermines,
    montantTotalEngage,
    montantTotalPaye,
    alertesCritiques,
    alertesWarning,
    projetsEnRetard,
    projetsEnPause,
    projetsPlanifies,
  };
}

// Initialize projetsData from localStorage or use demo data
export let projetsData: Projet[] = initializeProjectsData();

function initializeProjectsData(): Projet[] {
  const stored = loadProjectsFromStorage();
  return stored !== null ? stored : demoProjects;
}

// Fonctions CRUD
export function getProjets(): Projet[] {
  return [...projetsData];
}

export function getProjetById(id: string): Projet | undefined {
  return projetsData.find((p) => p.id === id);
}

export function addProjet(projet: Omit<Projet, 'id' | 'dateCreation' | 'dateModification'>): Projet {
  const newProjet: Projet = {
    ...projet,
    id: Date.now().toString(),
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  };
  projetsData.push(newProjet);
  return newProjet;
}

export function updateProjet(id: string, updates: Partial<Projet>): Projet | undefined {
  const index = projetsData.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  projetsData[index] = {
    ...projetsData[index],
    ...updates,
    dateModification: new Date().toISOString(),
  };
  return projetsData[index];
}

export function deleteProjet(id: string): boolean {
  const index = projetsData.findIndex((p) => p.id === id);
  if (index === -1) return false;
  projetsData.splice(index, 1);
  return true;
}

export function getExercices(): number[] {
  const exercices = new Set(projetsData.map((p) => p.exercice));
  return Array.from(exercices).sort((a, b) => b - a);
}

export function getCocontractants(): string[] {
  const cocontractants = new Set(projetsData.map((p) => p.cocontractant).filter(Boolean));
  return Array.from(cocontractants).sort() as string[];
}

export function getOperations(): string[] {
  const operations = new Set(projetsData.map((p) => p.operation).filter(Boolean));
  return Array.from(operations).sort() as string[];
}

// Mettre à jour le statut d'un projet rapidement
export function updateProjetStatut(id: string, nouveauStatut: StatutProjet): Projet | undefined {
  return updateProjet(id, { statut: nouveauStatut });
}
