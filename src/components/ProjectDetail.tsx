import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
  Gavel,
  HardHat,
  Wallet
} from 'lucide-react';
import type { Projet } from '@/types';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { getStatusLabel, getStatusColor } from '@/constants/statuses';

interface ProjectDetailProps {
  projet: Projet;
  onBack: () => void;
  onEdit: (projet: Projet) => void;
}

export function ProjectDetail({ projet, onBack, onEdit }: ProjectDetailProps) {
  const renderBoolean = (value: boolean) => (
    value ? (
      <span className="flex items-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" /> Oui
      </span>
    ) : (
      <span className="flex items-center gap-1 text-red-600">
        <XCircle className="h-4 w-4" /> Non
      </span>
    )
  );

  const renderReference = (ref: { numero: string; date: string }) => (
    <span className="text-sm">
      N° {ref.numero} du {formatDate(ref.date)}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{projet.programme}</h1>
            {projet.operation && (
              <p className="text-sm text-muted-foreground">{projet.operation}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={getStatusColor(projet.statut)}>
                {getStatusLabel(projet.statut)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Exercice {projet.exercice}
              </span>
              {projet.cocontractant && (
                <span className="text-sm text-muted-foreground">
                  | {projet.cocontractant}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => onEdit(projet)}>
          Modifier le projet
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Avancement Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progression des travaux</span>
                <span className="text-sm font-medium">{formatPercent(projet.travaux.avancementNouveau)}</span>
              </div>
              <Progress value={projet.travaux.avancementNouveau * 100} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Montant Engagé</p>
                <p className="text-lg font-bold">{formatCurrency(projet.contrat.montantEngage)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Montant Payé</p>
                <p className="text-lg font-bold">{formatCurrency(projet.paiement.cumulPaiement)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">% Payé</p>
                <p className="text-lg font-bold">{formatPercent(projet.paiement.pourcentageCumulPaiement)}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Paiement en instance</p>
                <p className="text-lg font-bold">{formatCurrency(projet.paiement.paiementEnInstance)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="cahier" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="cahier">
            <ClipboardList className="h-4 w-4 mr-2" />
            Cahier des charges
          </TabsTrigger>
          <TabsTrigger value="lancement">
            <Gavel className="h-4 w-4 mr-2" />
            Lancement
          </TabsTrigger>
          <TabsTrigger value="contrat">
            <FileText className="h-4 w-4 mr-2" />
            Contrat
          </TabsTrigger>
          <TabsTrigger value="travaux">
            <HardHat className="h-4 w-4 mr-2" />
            Travaux
          </TabsTrigger>
          <TabsTrigger value="paiement">
            <Wallet className="h-4 w-4 mr-2" />
            Paiement
          </TabsTrigger>
        </TabsList>

        {/* Cahier des charges */}
        <TabsContent value="cahier">
          <Card>
            <CardHeader>
              <CardTitle>Cahier des Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Références</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Référence Demande</p>
                      {renderReference(projet.referenceDemande)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Référence Notification</p>
                      {renderReference(projet.referenceNotification)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Documents</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Expression des besoins</span>
                      {renderBoolean(projet.cahierDesCharges.expressionBesoins)}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Dossier du terrain</span>
                      {renderBoolean(projet.cahierDesCharges.dossierTerrain)}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>CPS (Cahier des Prescriptions Spéciales)</span>
                      {renderBoolean(projet.cahierDesCharges.cps)}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>CCAG (Cahier des Clauses Administratives Générales)</span>
                      {renderBoolean(projet.cahierDesCharges.ccag)}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Rapport de présentation</span>
                      {renderBoolean(projet.cahierDesCharges.rapportPresentation)}
                    </div>
                  </div>
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Visa CC</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Transmission dossier pour visa CC</p>
                      {renderReference(projet.lancement.transmissionVisaCC)}
                    </div>
                    {projet.lancement.visaSousReserves && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm text-muted-foreground">Visa sous réserves</p>
                        {renderReference(projet.lancement.visaSousReserves)}
                        {projet.lancement.visaSousReserves.rapportReserves && (
                          <p className="text-sm text-amber-700 mt-1">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {projet.lancement.visaSousReserves.rapportReserves}
                          </p>
                        )}
                      </div>
                    )}
                    {projet.lancement.visaSansReserves && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-muted-foreground">Visa sans réserves</p>
                        {renderReference(projet.lancement.visaSansReserves)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Publication</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Transmission pour publication</p>
                      {renderReference(projet.lancement.transmissionPublication)}
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Publication</p>
                      {renderReference(projet.lancement.publication)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Durée de publication</p>
                        <p className="font-medium">{projet.lancement.dureePublication} jours</p>
                      </div>
                      <div className={`p-2 rounded ${projet.lancement.delaiRestantExpiration <= 7 && projet.lancement.delaiRestantExpiration > 0 ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                        <p className="text-sm text-muted-foreground">Délai restant</p>
                        <p className={`font-medium ${projet.lancement.delaiRestantExpiration <= 7 && projet.lancement.delaiRestantExpiration > 0 ? 'text-red-600' : ''}`}>
                          {projet.lancement.delaiRestantExpiration} jours
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Date COPEO</p>
                      <p className="font-medium">{formatDate(projet.lancement.dateCopeo)}</p>
                    </div>
                  </div>
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Visa Contrat</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Transmission du projet de contrat</p>
                      {renderReference(projet.contrat.transmissionProjetContrat)}
                    </div>
                    {projet.contrat.visaSousReserves && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm text-muted-foreground">Visa sous réserves</p>
                        {renderReference(projet.contrat.visaSousReserves)}
                      </div>
                    )}
                    {projet.contrat.visaSansReserves && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-muted-foreground">Visa sans réserves</p>
                        {renderReference(projet.contrat.visaSansReserves)}
                      </div>
                    )}
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Dossier d'engagement</p>
                      {renderReference(projet.contrat.dossierEngagement)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Montant</h4>
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">Montant Engagé (DA TTC)</p>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(projet.contrat.montantEngage)}</p>
                  </div>
                </div>
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">ODS et Installation</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">ODS (Ordre de Service)</p>
                      {renderReference(projet.travaux.ods)}
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Notification ODS</p>
                      <p className="font-medium">{formatDate(projet.travaux.notificationOds)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">PV d'installation</p>
                      {renderReference(projet.travaux.pvInstallation)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Délais et Avancement</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Délais de réalisation</p>
                      <p className="font-medium">{projet.travaux.delaisRealisation} jours</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">Date d'effet de commencement</p>
                      <p className="font-medium">{formatDate(projet.travaux.dateEffetCommencement)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Avancement ancien</p>
                        <p className="font-medium">{formatPercent(projet.travaux.avancementAncien)}</p>
                      </div>
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-muted-foreground">Avancement nouveau</p>
                        <p className="font-medium text-blue-700">{formatPercent(projet.travaux.avancementNouveau)}</p>
                      </div>
                    </div>
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Paiements</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-sm text-muted-foreground">% Cumul paiement</p>
                      <p className="font-medium">{formatPercent(projet.paiement.pourcentageCumulPaiement)}</p>
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-muted-foreground">Cumul paiement</p>
                      <p className="font-medium text-green-700">{formatCurrency(projet.paiement.cumulPaiement)}</p>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-sm text-muted-foreground">Paiement en instance</p>
                      <p className="font-medium text-amber-700">{formatCurrency(projet.paiement.paiementEnInstance)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase">Avances</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Avance forfaitaire</p>
                        <p className="font-medium">{formatCurrency(projet.paiement.montantAvanceForfaitaire)}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Restitution (A)</p>
                        <p className="font-medium">{formatCurrency(projet.paiement.restitutionAvanceForfaitaire)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Avance approvisionnement</p>
                        <p className="font-medium">{formatCurrency(projet.paiement.montantAvanceApprovisionnement)}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Restitution (B)</p>
                        <p className="font-medium">{formatCurrency(projet.paiement.restitutionAvanceApprovisionnement)}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded ${projet.paiement.tauxRestitutionAvances < 1 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      <p className="text-sm text-muted-foreground">Taux de restitution des avances (A+B)</p>
                      <p className={`font-medium ${projet.paiement.tauxRestitutionAvances < 1 ? 'text-red-700' : 'text-green-700'}`}>
                        {formatPercent(projet.paiement.tauxRestitutionAvances)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contraintes et Observations */}
      {(projet.contraintes.length > 0 || projet.observations) && (
        <Card>
          <CardHeader>
            <CardTitle>Contraintes et Observations</CardTitle>
          </CardHeader>
          <CardContent>
            {projet.contraintes.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Contraintes</h4>
                <div className="space-y-2">
                  {projet.contraintes.map((contrainte, index) => (
                    <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded">
                      <p className="font-medium text-amber-800">{contrainte.description}</p>
                      <p className="text-sm text-amber-700 mt-1">
                        <span className="font-medium">Mesures prises:</span> {contrainte.mesuresPrises}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projet.observations && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Observations</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800">{projet.observations}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
