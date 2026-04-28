import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import type { Projet, ArretReprise } from '@/types';
import { STATUS_CONFIG, LANCEMENT_TYPE_OPTIONS, CATEGORIE_ENTREPRISE_OPTIONS } from '@/constants/statuses';
import { formatCurrencyInput } from '@/lib/utils';

interface ProjectFormProps {
  projet?: Projet;
  onSave: (projet: Projet | Omit<Projet, 'id' | 'dateCreation' | 'dateModification'>) => void;
  onCancel: () => void;
}

const emptyProjet: Omit<Projet, 'id' | 'dateCreation' | 'dateModification'> = {
  exercice: new Date().getFullYear(),
  programme: '',
  operation: '',
  cocontractant: '',
  referenceDemande: { numero: '', date: '' },
  referenceNotification: { numero: '', date: '' },
  cahierDesCharges: {
    expressionBesoins: false,
    dossierTerrain: false,
    cps: false,
    ccag: false,
    rapportPresentation: false,
  },
  lancement: {
    transmissionVisaCC: { numero: '', date: '' },
    transmissionPublication: { numero: '', date: '' },
    publication: { numero: '', date: '' },
    dureePublication: 30,
    delaiRestantExpiration: 0,
    dateCopeo: '',
    typeLancement: undefined,
  },
  contrat: {
    transmissionProjetContrat: { numero: '', date: '' },
    dossierEngagement: { numero: '', date: '' },
    montantEngage: 0,
    categorieEntreprise: undefined,
  },
  travaux: {
    ods: { numero: '', date: '' },
    notificationOds: '',
    pvInstallation: { numero: '', date: '' },
    delaisRealisation: 0,
    dateEffetCommencement: '',
    avancementAncien: 0,
    avancementNouveau: 0,
    arretsReprises: [],
  },
  paiement: {
    pourcentageCumulPaiement: 0,
    cumulPaiement: 0,
    paiementEnInstance: 0,
    montantAvanceForfaitaire: 0,
    restitutionAvanceForfaitaire: 0,
    montantAvanceApprovisionnement: 0,
    restitutionAvanceApprovisionnement: 0,
    tauxRestitutionAvances: 0,
  },
  contraintes: [],
  observations: '',
  statut: 'planifie',
};

export function ProjectForm({ projet, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<Omit<Projet, 'id' | 'dateCreation' | 'dateModification'>>(() => {
    if (projet) {
      const { id, dateCreation, dateModification, ...rest } = projet;
      return {
        ...rest,
        statut: rest.statut || 'planifie',
        travaux: {
          ...rest.travaux,
          arretsReprises: Array.isArray(rest.travaux?.arretsReprises) ? rest.travaux.arretsReprises : [],
        },
      };
    }
    return {
      ...emptyProjet,
      travaux: {
        ...emptyProjet.travaux,
        arretsReprises: Array.isArray(emptyProjet.travaux.arretsReprises) ? emptyProjet.travaux.arretsReprises : [],
      },
    };
  });
  const [activeTab, setActiveTab] = useState('general');
  const [calculatedStoppages, setCalculatedStoppages] = useState<{ delaiArret: number[] }>({ delaiArret: [] });

  useEffect(() => {
    if (projet) {
      const { id, dateCreation, dateModification, ...rest } = projet;
      // Ensure arretsReprises is initialized as array (for backward compatibility with existing projects)
      const arretsReprises = Array.isArray(rest.travaux.arretsReprises) ? rest.travaux.arretsReprises : [];
      const formDataWithDefaults = {
        ...rest,
        // Ensure statut has a valid value (default to 'planifie' if missing or invalid)
        statut: rest.statut || 'planifie',
        travaux: {
          ...rest.travaux,
          arretsReprises,
        },
      };
      setFormData(formDataWithDefaults);
    }
  }, [projet]);

  useEffect(() => {
    const calculateDelaiRestant = () => {
      const publicationDate = formData.lancement.publication.date;
      const duration = formData.lancement.dureePublication;

      if (!publicationDate || duration === undefined || duration === null || duration === 0 || isNaN(duration)) {
        return 0;
      }

      try {
        const pubDate = new Date(publicationDate);
        if (isNaN(pubDate.getTime())) {
          return 0;
        }

        const expirationDate = new Date(pubDate);
        expirationDate.setDate(expirationDate.getDate() + duration);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);

        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
      } catch {
        return 0;
      }
    };

    const calculateCopeoDate = () => {
      const publicationDate = formData.lancement.publication.date;
      const duration = formData.lancement.dureePublication;

      if (!publicationDate || duration === undefined || duration === null || duration === 0 || isNaN(duration)) {
        return '';
      }

      try {
        const pubDate = new Date(publicationDate);
        if (isNaN(pubDate.getTime())) {
          return '';
        }

        const copeoDate = new Date(pubDate);
        copeoDate.setDate(copeoDate.getDate() + duration + 15);

        return copeoDate.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const newDelai = calculateDelaiRestant();
    const newCopeoDate = calculateCopeoDate();

    setFormData((prev) => ({
      ...prev,
      lancement: {
        ...prev.lancement,
        delaiRestantExpiration: newDelai,
        dateCopeo: newCopeoDate,
      },
    }));
  }, [formData.lancement.publication.date, formData.lancement.dureePublication]);

  useEffect(() => {
    const calculateTauxRestitution = () => {
      const { restitutionAvanceApprovisionnement, restitutionAvanceForfaitaire, montantAvanceApprovisionnement, montantAvanceForfaitaire } = formData.paiement;
      
      const numerateur = restitutionAvanceApprovisionnement + restitutionAvanceForfaitaire;
      const denominateur = montantAvanceApprovisionnement + montantAvanceForfaitaire;

      if (denominateur === 0 || denominateur === undefined || isNaN(denominateur)) {
        return 0;
      }

      return numerateur / denominateur;
    };

    const newTaux = calculateTauxRestitution();

    setFormData((prev) => ({
      ...prev,
      paiement: {
        ...prev.paiement,
        tauxRestitutionAvances: newTaux,
      },
    }));
  }, [
    formData.paiement.restitutionAvanceApprovisionnement,
    formData.paiement.restitutionAvanceForfaitaire,
    formData.paiement.montantAvanceApprovisionnement,
    formData.paiement.montantAvanceForfaitaire,
  ]);
  useEffect(() => {
    const calculateStoppageDelays = () => {
      const arretes = Array.isArray(formData.travaux.arretsReprises) ? formData.travaux.arretsReprises : [];
      const delays = arretes.map((arret) => {
        const { dateEffetArret, dateEffetReprise } = arret;

        if (!dateEffetArret || !dateEffetReprise) {
          return 0;
        }

        try {
          const startDate = new Date(dateEffetArret);
          const endDate = new Date(dateEffetReprise);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return 0;
          }

          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return Math.max(0, diffDays);
        } catch {
          return 0;
        }
      });

      setCalculatedStoppages({ delaiArret: delays });
    };

    calculateStoppageDelays();
  }, [formData.travaux.arretsReprises, formData.travaux]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: prevent saving with empty status
    if (!formData.statut || formData.statut.trim() === '') {
      alert('Le statut du projet est obligatoire. Veuillez en sélectionner un.');
      return;
    }
    
    // Validation: require programme field
    if (!formData.programme || formData.programme.trim() === '') {
      alert('Le programme est un champ obligatoire.');
      return;
    }
    
    onSave(projet ? { ...formData, id: projet.id, dateCreation: projet.dateCreation, dateModification: new Date().toISOString() } : formData);
  };

  const updateField = (path: string, value: unknown) => {
    setFormData((prev) => {
      const keys = path.split('.');
      
      const updateNested = (obj: any, keyPath: string[]): any => {
        if (keyPath.length === 0) return obj;
        
        const [head, ...tail] = keyPath;
        const isArrayIndex = /^\d+$/.test(head);
        
        if (isArrayIndex) {
          const index = parseInt(head, 10);
          if (Array.isArray(obj)) {
            const newArr = [...obj];
            newArr[index] = updateNested(obj[index], tail);
            return newArr;
          }
        }
        
        if (tail.length === 0) {
          // Last key - set the value
          return { ...obj, [head]: value };
        }
        
        // Recurse deeper
        return { ...obj, [head]: updateNested(obj[head], tail) };
      };
      
      return updateNested(prev, keys);
    });
  };

  const getTotalStoppageDelay = (): number => {
    return calculatedStoppages.delaiArret.reduce((sum, delay) => sum + delay, 0);
  };

  const getUpdatedRealizationDelay = (): number => {
    return formData.travaux.delaisRealisation + getTotalStoppageDelay();
  };

  const getUpdatedContractCompletionDate = (): string => {
    const startDate = formData.travaux.dateEffetCommencement;
    if (!startDate) return '';

    try {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) return '';

      const updatedDelay = getUpdatedRealizationDelay();
      date.setDate(date.getDate() + updatedDelay);

      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const isHorsDelai = (): boolean => {
    const completionDate = getUpdatedContractCompletionDate();
    if (!completionDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completion = new Date(completionDate);
    completion.setHours(0, 0, 0, 0);

    const isPast = completion < today;
    const isIncomplete = formData.travaux.avancementNouveau < 1;

    return isPast && isIncomplete;
  };

  const addStoppage = () => {
    const newArret: ArretReprise = {
      referenceOdsArret: { numero: '', date: '' },
      dateEffetArret: '',
      motifsArret: '',
      referenceOdsReprise: { numero: '', date: '' },
      dateEffetReprise: '',
    };
    const currentArretes = Array.isArray(formData.travaux.arretsReprises) ? formData.travaux.arretsReprises : [];
    updateField('travaux.arretsReprises', [...currentArretes, newArret]);
  };

  const removeStoppage = (index: number) => {
    const currentArretes = Array.isArray(formData.travaux.arretsReprises) ? formData.travaux.arretsReprises : [];
    const updated = currentArretes.filter((_, i) => i !== index);
    updateField('travaux.arretsReprises', updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {projet ? 'Modifier le Projet' : 'Nouveau Projet'}
          </h1>
        </div>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="cahier">Cahier des charges</TabsTrigger>
          <TabsTrigger value="lancement">Lancement</TabsTrigger>
          <TabsTrigger value="contrat">Contrat</TabsTrigger>
          <TabsTrigger value="travaux">Travaux</TabsTrigger>
          <TabsTrigger value="paiement">Paiement</TabsTrigger>
        </TabsList>

        {/* Général */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programme">Programme *</Label>
                  <Input
                    id="programme"
                    value={formData.programme}
                    onChange={(e) => updateField('programme', e.target.value)}
                    placeholder="Nom du programme"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operation">Opération</Label>
                  <Input
                    id="operation"
                    value={formData.operation || ''}
                    onChange={(e) => updateField('operation', e.target.value)}
                    placeholder="Nom de l'opération"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercice">Exercice *</Label>
                  <Input
                    id="exercice"
                    type="number"
                    value={formData.exercice}
                    onChange={(e) => updateField('exercice', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value) => updateField('statut', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_CONFIG.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Référence Demande Prévision</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="N°"
                      value={formData.referenceDemande.numero}
                      onChange={(e) => updateField('referenceDemande.numero', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={formData.referenceDemande.date}
                      onChange={(e) => updateField('referenceDemande.date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Référence Notification</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="N°"
                      value={formData.referenceNotification.numero}
                      onChange={(e) => updateField('referenceNotification.numero', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={formData.referenceNotification.date}
                      onChange={(e) => updateField('referenceNotification.date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations">Observations</Label>
                <Input
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => updateField('observations', e.target.value)}
                  placeholder="Observations générales"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cahier des charges */}
        <TabsContent value="cahier">
          <Card>
            <CardHeader>
              <CardTitle>Cahier des Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expressionBesoins"
                    checked={formData.cahierDesCharges.expressionBesoins}
                    onCheckedChange={(checked) => updateField('cahierDesCharges.expressionBesoins', checked)}
                  />
                  <Label htmlFor="expressionBesoins">Expression des besoins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dossierTerrain"
                    checked={formData.cahierDesCharges.dossierTerrain}
                    onCheckedChange={(checked) => updateField('cahierDesCharges.dossierTerrain', checked)}
                  />
                  <Label htmlFor="dossierTerrain">Dossier du terrain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cps"
                    checked={formData.cahierDesCharges.cps}
                    onCheckedChange={(checked) => updateField('cahierDesCharges.cps', checked)}
                  />
                  <Label htmlFor="cps">CPS (Cahier des Prescriptions Spéciales)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ccag"
                    checked={formData.cahierDesCharges.ccag}
                    onCheckedChange={(checked) => updateField('cahierDesCharges.ccag', checked)}
                  />
                  <Label htmlFor="ccag">CCAG (Cahier des Clauses Administratives Générales)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rapportPresentation"
                    checked={formData.cahierDesCharges.rapportPresentation}
                    onCheckedChange={(checked) => updateField('cahierDesCharges.rapportPresentation', checked)}
                  />
                  <Label htmlFor="rapportPresentation">Rapport de présentation</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lancement */}
        <TabsContent value="lancement">
          <Card>
            <CardHeader>
              <CardTitle>Procédure de Lancement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Transmission dossier pour visa CC</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.lancement.transmissionVisaCC.numero}
                    onChange={(e) => updateField('lancement.transmissionVisaCC.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.lancement.transmissionVisaCC.date}
                    onChange={(e) => updateField('lancement.transmissionVisaCC.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Transmission pour publication</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.lancement.transmissionPublication.numero}
                    onChange={(e) => updateField('lancement.transmissionPublication.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.lancement.transmissionPublication.date}
                    onChange={(e) => updateField('lancement.transmissionPublication.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Publication</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.lancement.publication.numero}
                    onChange={(e) => updateField('lancement.publication.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.lancement.publication.date}
                    onChange={(e) => updateField('lancement.publication.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeLancement">Type de lancement</Label>
                <Select
                  value={formData.lancement.typeLancement || ''}
                  onValueChange={(value) => updateField('lancement.typeLancement', value || undefined)}
                >
                  <SelectTrigger id="typeLancement">
                    <SelectValue placeholder="Sélectionner un type de lancement" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANCEMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dureePublication">Durée publication (jours)</Label>
                  <Input
                    id="dureePublication"
                    type="number"
                    value={formData.lancement.dureePublication}
                    onChange={(e) => updateField('lancement.dureePublication', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delaiRestant">Délai restant (jours)</Label>
                  <Input
                    id="delaiRestant"
                    type="number"
                    value={formData.lancement.delaiRestantExpiration}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateCopeo">Date COPEO</Label>
                  <Input
                    id="dateCopeo"
                    type="date"
                    value={formData.lancement.dateCopeo}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contrat */}
        <TabsContent value="contrat">
          <Card>
            <CardHeader>
              <CardTitle>Contrat et Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Transmission du projet de contrat</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.contrat.transmissionProjetContrat.numero}
                    onChange={(e) => updateField('contrat.transmissionProjetContrat.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.contrat.transmissionProjetContrat.date}
                    onChange={(e) => updateField('contrat.transmissionProjetContrat.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dossier d'engagement</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.contrat.dossierEngagement.numero}
                    onChange={(e) => updateField('contrat.dossierEngagement.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.contrat.dossierEngagement.date}
                    onChange={(e) => updateField('contrat.dossierEngagement.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="montantEngage">Montant Engagé (DA/TTC)</Label>
                <div className="relative">
                  <Input
                    id="montantEngage"
                    type="number"
                    inputMode="numeric"
                    placeholder="Ex: 45000000"
                    value={formData.contrat.montantEngage}
                    onChange={(e) => updateField('contrat.montantEngage', parseFloat(e.target.value))}
                    className="font-mono"
                  />
                  {formData.contrat.montantEngage > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.contrat.montantEngage)} DA</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contratCocontractant">Cocontractant</Label>
                <Input
                  id="contratCocontractant"
                  value={formData.contrat.cocontractant || ''}
                  onChange={(e) => updateField('contrat.cocontractant', e.target.value)}
                  placeholder="Nom du cocontractant dans le contrat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorieEntreprise">Catégorie entreprise</Label>
                <Select
                  value={formData.contrat.categorieEntreprise || ''}
                  onValueChange={(value) => updateField('contrat.categorieEntreprise', value || undefined)}
                >
                  <SelectTrigger id="categorieEntreprise">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIE_ENTREPRISE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Travaux */}
        <TabsContent value="travaux">
          <Card>
            <CardHeader>
              <CardTitle>Lancement des Travaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ODS (Ordre de Service)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.travaux.ods.numero}
                    onChange={(e) => updateField('travaux.ods.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.travaux.ods.date}
                    onChange={(e) => updateField('travaux.ods.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationOds">Notification ODS</Label>
                <Input
                  id="notificationOds"
                  type="date"
                  value={formData.travaux.notificationOds}
                  onChange={(e) => updateField('travaux.notificationOds', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>PV d'installation</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="N°"
                    value={formData.travaux.pvInstallation.numero}
                    onChange={(e) => updateField('travaux.pvInstallation.numero', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={formData.travaux.pvInstallation.date}
                    onChange={(e) => updateField('travaux.pvInstallation.date', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delaisRealisation">Délais de réalisation (jours)</Label>
                  <Input
                    id="delaisRealisation"
                    type="number"
                    value={formData.travaux.delaisRealisation}
                    onChange={(e) => updateField('travaux.delaisRealisation', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateEffet">Date d'effet de commencement</Label>
                  <Input
                    id="dateEffet"
                    type="date"
                    value={formData.travaux.dateEffetCommencement}
                    onChange={(e) => updateField('travaux.dateEffetCommencement', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avancementAncien">Avancement ancien (0-1)</Label>
                  <Input
                    id="avancementAncien"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.travaux.avancementAncien}
                    onChange={(e) => updateField('travaux.avancementAncien', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avancementNouveau">Avancement nouveau (0-1)</Label>
                  <Input
                    id="avancementNouveau"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.travaux.avancementNouveau}
                    onChange={(e) => updateField('travaux.avancementNouveau', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Arrêts et reprises de travaux</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStoppage}>
                    + Ajouter un arrêt
                  </Button>
                </div>

                {!Array.isArray(formData.travaux.arretsReprises) || formData.travaux.arretsReprises.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucun arrêt de travaux enregistré</p>
                ) : (
                  <div className="space-y-6">
                    {Array.isArray(formData.travaux.arretsReprises) && formData.travaux.arretsReprises.map((arret, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-sm">Arrêt et Reprise n°{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStoppage(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕ Supprimer
                          </Button>
                        </div>

                        {/* Arrêt section */}
                        <div className="bg-white p-3 rounded mb-4">
                          <p className="text-xs font-semibold text-slate-600 mb-3">ARRÊT DE TRAVAUX</p>
                          <div className="grid md:grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Référence ODS d'arrêt n°{index + 1}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="N°"
                                  size={32}
                                  className="text-sm"
                                  value={arret.referenceOdsArret.numero}
                                  onChange={(e) =>
                                    updateField(`travaux.arretsReprises.${index}.referenceOdsArret.numero`, e.target.value)
                                  }
                                />
                                <Input
                                  type="date"
                                  size={32}
                                  className="text-sm"
                                  value={arret.referenceOdsArret.date}
                                  onChange={(e) =>
                                    updateField(`travaux.arretsReprises.${index}.referenceOdsArret.date`, e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Date d'effet</Label>
                              <Input
                                type="date"
                                className="text-sm"
                                value={arret.dateEffetArret}
                                onChange={(e) =>
                                  updateField(`travaux.arretsReprises.${index}.dateEffetArret`, e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Motifs d'arrêt</Label>
                            <Input
                              placeholder="Indiquer les raisons de l'arrêt des travaux"
                              className="text-sm"
                              value={arret.motifsArret}
                              onChange={(e) =>
                                updateField(`travaux.arretsReprises.${index}.motifsArret`, e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Reprise section */}
                        <div className="bg-white p-3 rounded mb-4">
                          <p className="text-xs font-semibold text-slate-600 mb-3">REPRISE DE TRAVAUX</p>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Référence ODS de reprise n°{index + 1}</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="N°"
                                  size={32}
                                  className="text-sm"
                                  value={arret.referenceOdsReprise.numero}
                                  onChange={(e) =>
                                    updateField(`travaux.arretsReprises.${index}.referenceOdsReprise.numero`, e.target.value)
                                  }
                                />
                                <Input
                                  type="date"
                                  size={32}
                                  className="text-sm"
                                  value={arret.referenceOdsReprise.date}
                                  onChange={(e) =>
                                    updateField(`travaux.arretsReprises.${index}.referenceOdsReprise.date`, e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Date d'effet</Label>
                              <Input
                                type="date"
                                className="text-sm"
                                value={arret.dateEffetReprise}
                                onChange={(e) =>
                                  updateField(`travaux.arretsReprises.${index}.dateEffetReprise`, e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculated delay */}
                        <div className="bg-blue-50 p-3 rounded">
                          <Label className="text-xs font-semibold">Délai d'arrêt (jours)</Label>
                          <Input
                            type="number"
                            className="text-sm"
                            value={calculatedStoppages.delaiArret[index] || 0}
                            disabled
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary calculations */}
              <div className="border-t pt-6 mt-6 space-y-4 bg-amber-50 p-4 rounded">
                <h3 className="font-semibold text-sm">Récapitulatif des délais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Délai total d'arrêt (jours)</Label>
                    <Input type="number" value={getTotalStoppageDelay()} disabled className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Délai de réalisation actualisé (jours)</Label>
                    <Input type="number" value={getUpdatedRealizationDelay()} disabled className="text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date fin contractuelle actualisée</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={getUpdatedContractCompletionDate()}
                      disabled
                      className="text-sm flex-1"
                    />
                    {isHorsDelai() && (
                      <div className="text-red-600 font-bold text-lg whitespace-nowrap">HORS-DELAI</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiement */}
        <TabsContent value="paiement">
          <Card>
            <CardHeader>
              <CardTitle>Paiements et Avances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pourcentageCumul">% Cumul paiement (0-1)</Label>
                  <Input
                    id="pourcentageCumul"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.paiement.pourcentageCumulPaiement}
                    onChange={(e) => updateField('paiement.pourcentageCumulPaiement', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cumulPaiement">Cumul paiement (DA/TTC)</Label>
                  <div className="relative">
                    <Input
                      id="cumulPaiement"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 25000000"
                      value={formData.paiement.cumulPaiement}
                      onChange={(e) => updateField('paiement.cumulPaiement', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                    {formData.paiement.cumulPaiement > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.cumulPaiement)} DA</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paiementInstance">Paiement en instance (DA/TTC)</Label>
                <div className="relative">
                  <Input
                    id="paiementInstance"
                    type="number"
                    inputMode="numeric"
                    placeholder="Ex: 5000000"
                    value={formData.paiement.paiementEnInstance}
                    onChange={(e) => updateField('paiement.paiementEnInstance', parseFloat(e.target.value))}
                    className="font-mono"
                  />
                  {formData.paiement.paiementEnInstance > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.paiementEnInstance)} DA</div>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avanceForfaitaire">Avance forfaitaire (DA/TTC)</Label>
                  <div className="relative">
                    <Input
                      id="avanceForfaitaire"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 3750000"
                      value={formData.paiement.montantAvanceForfaitaire}
                      onChange={(e) => updateField('paiement.montantAvanceForfaitaire', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                    {formData.paiement.montantAvanceForfaitaire > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.montantAvanceForfaitaire)} DA</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restitutionForfaitaire">Restitution avance forfaitaire (DA/TTC)</Label>
                  <div className="relative">
                    <Input
                      id="restitutionForfaitaire"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 3750000"
                      value={formData.paiement.restitutionAvanceForfaitaire}
                      onChange={(e) => updateField('paiement.restitutionAvanceForfaitaire', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                    {formData.paiement.restitutionAvanceForfaitaire > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.restitutionAvanceForfaitaire)} DA</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avanceAppro">Avance approvisionnement (DA/TTC)</Label>
                  <div className="relative">
                    <Input
                      id="avanceAppro"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 1000000"
                      value={formData.paiement.montantAvanceApprovisionnement}
                      onChange={(e) => updateField('paiement.montantAvanceApprovisionnement', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                    {formData.paiement.montantAvanceApprovisionnement > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.montantAvanceApprovisionnement)} DA</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restitutionAppro">Restitution avance approvisionnement (DA/TTC)</Label>
                  <div className="relative">
                    <Input
                      id="restitutionAppro"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ex: 1000000"
                      value={formData.paiement.restitutionAvanceApprovisionnement}
                      onChange={(e) => updateField('paiement.restitutionAvanceApprovisionnement', parseFloat(e.target.value))}
                      className="font-mono"
                    />
                    {formData.paiement.restitutionAvanceApprovisionnement > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{formatCurrencyInput(formData.paiement.restitutionAvanceApprovisionnement)} DA</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tauxRestitution">Taux de restitution des avances (0-1)</Label>
                <Input
                  id="tauxRestitution"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.paiement.tauxRestitutionAvances}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
