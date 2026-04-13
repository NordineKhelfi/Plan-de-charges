import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Printer, 
  FileDown, 
  Filter, 
  Eye, 
  Edit3,
  CheckCircle2,
  X,
  Search
} from 'lucide-react';
import type { Projet, FiltresEtatSortie, StatutProjet } from '@/types';
import { formatCurrency, formatPercent, getStatusLabel, getStatusColor } from '@/lib/utils';
import { getExercices, getCocontractants, getOperations, updateProjetStatut } from '@/data/projets';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EtatSortieProps {
  projets: Projet[];
  onViewProject: (projet: Projet) => void;
  onEditProject: (projet: Projet) => void;
  onRefresh: () => void;
}

const statutsFiltres: { value: StatutProjet | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'planifie', label: 'Planifié' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_pause', label: 'À l\'arrêt' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'termine', label: 'Achevé' },
  { value: 'annule', label: 'Annulé' },
];

export function EtatSortie({ projets, onViewProject, onEditProject, onRefresh }: EtatSortieProps) {
  const [filtres, setFiltres] = useState<FiltresEtatSortie>({
    statut: 'tous',
  });
  const [recherche, setRecherche] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const exercices = useMemo(() => getExercices(), []);
  const cocontractants = useMemo(() => getCocontractants(), []);
  const operations = useMemo(() => getOperations(), []);

  const projetsFiltres = useMemo(() => {
    return projets.filter((projet) => {
      if (filtres.planAnnuel && projet.exercice !== filtres.planAnnuel) return false;
      if (filtres.cocontractant && projet.cocontractant !== filtres.cocontractant) return false;
      if (filtres.operation && projet.operation !== filtres.operation) return false;
      if (filtres.statut && filtres.statut !== 'tous' && projet.statut !== filtres.statut) return false;
      if (recherche) {
        const search = recherche.toLowerCase();
        const matchProgramme = projet.programme.toLowerCase().includes(search);
        const matchOperation = projet.operation?.toLowerCase().includes(search);
        const matchCocontractant = projet.cocontractant?.toLowerCase().includes(search);
        if (!matchProgramme && !matchOperation && !matchCocontractant) return false;
      }
      return true;
    });
  }, [projets, filtres, recherche]);

  const handlePrintPDF = async () => {
    if (!printRef.current) return;
    
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`Etat_Sortie_Projets_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChangerStatut = (projet: Projet, nouveauStatut: StatutProjet) => {
    updateProjetStatut(projet.id, nouveauStatut);
    onRefresh();
  };

  const clearFilters = () => {
    setFiltres({ statut: 'tous' });
    setRecherche('');
  };

  const hasActiveFilters = filtres.planAnnuel || filtres.cocontractant || filtres.operation || 
    (filtres.statut && filtres.statut !== 'tous') || recherche;

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de l'État de Sortie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filtres.planAnnuel?.toString() || 'all'}
              onValueChange={(value) => setFiltres({ ...filtres, planAnnuel: value === 'all' ? undefined : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Plan Annuel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les exercices</SelectItem>
                {exercices.map((ex) => (
                  <SelectItem key={ex} value={ex.toString()}>{ex}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtres.operation || 'all'}
              onValueChange={(value) => setFiltres({ ...filtres, operation: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les opérations</SelectItem>
                {operations.map((op) => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtres.cocontractant || 'all'}
              onValueChange={(value) => setFiltres({ ...filtres, cocontractant: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cocontractant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cocontractants</SelectItem>
                {cocontractants.map((cc) => (
                  <SelectItem key={cc} value={cc}>{cc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtres.statut || 'tous'}
              onValueChange={(value) => setFiltres({ ...filtres, statut: value as StatutProjet | 'tous' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statutsFiltres.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{projetsFiltres.length}</span> projet(s) trouvé(s)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={handlePrintPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tableau à imprimer */}
      <div ref={printRef} className="bg-white">
        {/* En-tête pour impression */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center">ÉTAT DE SORTIE DES PROJETS</h1>
          <p className="text-center text-muted-foreground">
            Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
          {filtres.planAnnuel && (
            <p className="text-center">Exercice: {filtres.planAnnuel}</p>
          )}
          {filtres.statut && filtres.statut !== 'tous' && (
            <p className="text-center">Statut: {getStatusLabel(filtres.statut)}</p>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Exercice</TableHead>
                    <TableHead className="text-xs">Programme</TableHead>
                    <TableHead className="text-xs">Opération</TableHead>
                    <TableHead className="text-xs">Cocontractant</TableHead>
                    <TableHead className="text-xs text-right">Montant Engagé</TableHead>
                    <TableHead className="text-xs text-center">Avancement</TableHead>
                    <TableHead className="text-xs text-right">Payé</TableHead>
                    <TableHead className="text-xs text-center">Statut</TableHead>
                    <TableHead className="text-xs text-center print:hidden">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetsFiltres.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun projet trouvé avec ces critères
                      </TableCell>
                    </TableRow>
                  ) : (
                    projetsFiltres.map((projet) => (
                      <TableRow key={projet.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{projet.exercice}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={projet.programme}>
                          {projet.programme}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">
                          {projet.operation || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {projet.cocontractant || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(projet.contrat.montantEngage)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${projet.travaux.avancementNouveau * 100}%` }}
                              />
                            </div>
                            <span className="text-xs">{formatPercent(projet.travaux.avancementNouveau)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(projet.paiement.cumulPaiement)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(projet.statut)} text-xs`}>
                            {getStatusLabel(projet.statut)}
                          </Badge>
                        </TableCell>
                        <TableCell className="print:hidden">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onViewProject(projet)}
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onEditProject(projet)}
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  title="Changer statut"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modifier le statut</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-2 py-4">
                                  {statutsFiltres.filter(s => s.value !== 'tous').map((s) => (
                                    <Button
                                      key={s.value}
                                      variant={projet.statut === s.value ? 'default' : 'outline'}
                                      onClick={() => handleChangerStatut(projet, s.value as StatutProjet)}
                                      className="justify-start"
                                    >
                                      <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(s.value as StatutProjet).split(' ')[0]}`} />
                                      {s.label}
                                    </Button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pied de page pour impression */}
        <div className="hidden print:block mt-6 text-center text-sm text-muted-foreground">
          <p>Document généré par le système de gestion des plans de charges</p>
        </div>
      </div>
    </div>
  );
}
