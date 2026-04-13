import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  FileDown,
  Plus,
  X,
  RotateCcw,
  Upload,
  Download
} from 'lucide-react';
import type { Projet, FiltresProjet } from '@/types';
import { formatCurrency, formatDate, formatPercent, getStatusLabel, getStatusColor } from '@/lib/utils';
import { getExercices, getCocontractants, getOperations } from '@/data/projets';
import { exportProjectsToJSON, importProjectsFromJSON } from '@/lib/storage';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ProjectListProps {
  projets: Projet[];
  filtreStatut?: string;
  filtreExercice?: number;
  onViewProject: (projet: Projet) => void;
  onEditProject: (projet: Projet) => void;
  onDeleteProject: (projet: Projet) => void;
  onAddProject: () => void;
  onClearFilters: () => void;
  onProjectsImported: (projects: Projet[]) => void;
}

const ITEMS_PER_PAGE = 10;

export function ProjectList({ 
  projets, 
  filtreStatut,
  filtreExercice,
  onViewProject, 
  onEditProject, 
  onDeleteProject,
  onAddProject,
  onClearFilters,
  onProjectsImported
}: ProjectListProps) {
  const [filtres, setFiltres] = useState<FiltresProjet>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportErrors, setShowImportErrors] = useState(false);

  const exercices = useMemo(() => getExercices(), []);
  const cocontractants = useMemo(() => getCocontractants(), []);
  const operations = useMemo(() => getOperations(), []);

  // Appliquer les filtres externes (depuis le Dashboard)
  useEffect(() => {
    if (filtreStatut) {
      setFiltres(prev => ({ ...prev, statut: filtreStatut }));
    }
    if (filtreExercice) {
      setFiltres(prev => ({ ...prev, exercice: filtreExercice }));
    }
  }, [filtreStatut, filtreExercice]);

  const projetsFiltres = useMemo(() => {
    return projets.filter((projet) => {
      if (filtres.exercice && projet.exercice !== filtres.exercice) return false;
      if (filtres.statut && projet.statut !== filtres.statut) return false;
      if (filtres.cocontractant && projet.cocontractant !== filtres.cocontractant) return false;
      if (filtres.operation && projet.operation !== filtres.operation) return false;
      if (filtres.recherche) {
        const search = filtres.recherche.toLowerCase();
        const matchProgramme = projet.programme.toLowerCase().includes(search);
        const matchOperation = projet.operation?.toLowerCase().includes(search);
        const matchCocontractant = projet.cocontractant?.toLowerCase().includes(search);
        const matchRef = projet.referenceDemande.numero.includes(search);
        if (!matchProgramme && !matchOperation && !matchCocontractant && !matchRef) return false;
      }
      return true;
    });
  }, [projets, filtres]);

  const totalPages = Math.ceil(projetsFiltres.length / ITEMS_PER_PAGE);
  const projetsPagines = projetsFiltres.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = () => {
    const data = projetsFiltres.map((p) => ({
      'Exercice': p.exercice,
      'Programme': p.programme,
      'Opération': p.operation || '',
      'Cocontractant': p.cocontractant || '',
      'Référence Demande': `${p.referenceDemande.numero} du ${formatDate(p.referenceDemande.date)}`,
      'Référence Notification': `${p.referenceNotification.numero} du ${formatDate(p.referenceNotification.date)}`,
      'Statut': getStatusLabel(p.statut),
      'Montant Engagé': p.contrat.montantEngage,
      'Avancement': p.travaux.avancementNouveau,
      'Montant Payé': p.paiement.cumulPaiement,
      'Date Effet': formatDate(p.travaux.dateEffetCommencement),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projets');
    XLSX.writeFile(wb, `Tableau_de_bord_projets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportJSON = () => {
    try {
      const filename = `projects_backup_${new Date().toISOString().split('T')[0]}.json`;
      exportProjectsToJSON(projets, filename);
      toast.success('Projets exportés avec succès en JSON');
    } catch (error) {
      toast.error('Erreur lors de l\'export JSON');
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importProjectsFromJSON(file);
      if (!result.success) {
        setImportErrors(result.errors || ['Erreur lors de l\'import']);
        setShowImportErrors(true);
        return;
      }

      setImportErrors([]);
      setShowImportErrors(false);
      setImportDialogOpen(false);

      // Merge or replace logic
      let newProjects: Projet[];
      if (importMode === 'replace') {
        newProjects = result.projects || [];
      } else {
        // merge: keep existing, add new (avoid duplicates by id)
        const existingIds = new Set(projets.map(p => p.id));
        const imported = (result.projects || []).filter(p => !existingIds.has(p.id));
        newProjects = [...projets, ...imported];
      }

      // Call parent callback to update storage and state
      onProjectsImported(newProjects);

      toast.success(`${result.projects?.length || 0} projets importés avec succès`);
      event.target.value = '';
    } catch (error) {
      setImportErrors(['Erreur lors de la lecture du fichier']);
      setShowImportErrors(true);
    }
  };

  const clearFilters = () => {
    setFiltres({});
    setCurrentPage(1);
    onClearFilters();
  };

  const hasActiveFilters = filtreStatut || filtreExercice || filtres.cocontractant || 
    filtres.operation || filtres.recherche;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Liste des Projets</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onAddProject} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Projet
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
            <Button onClick={handleExportJSON} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Sauvegarder (JSON)
            </Button>
            <Button onClick={() => setImportDialogOpen(true)} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importer des projets</DialogTitle>
              <DialogDescription>
                Sélectionnez un fichier JSON de sauvegarde pour importer les projets.
              </DialogDescription>
            </DialogHeader>
            
            {showImportErrors && importErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
                <p className="font-semibold text-destructive mb-2">Erreurs lors de l'import:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                  {importErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="w-full"
                  id="file-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mode d'import:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                    />
                    <span className="text-sm">Fusionner (garder les projets existants)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                    />
                    <span className="text-sm">Remplacer (effacer d'abord)</span>
                  </label>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={filtres.recherche || ''}
              onChange={(e) => {
                setFiltres({ ...filtres, recherche: e.target.value });
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={filtres.exercice?.toString() || 'all'}
            onValueChange={(value) => {
              setFiltres({ ...filtres, exercice: value === 'all' ? undefined : parseInt(value) });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Exercice" />
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
            onValueChange={(value) => {
              setFiltres({ ...filtres, operation: value === 'all' ? undefined : value });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
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
            onValueChange={(value) => {
              setFiltres({ ...filtres, cocontractant: value === 'all' ? undefined : value });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
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
            value={filtres.statut || 'all'}
            onValueChange={(value) => {
              setFiltres({ ...filtres, statut: value === 'all' ? undefined : value });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="planifie">Planifié</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="en_pause">À l&apos;arrêt</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
              <SelectItem value="termine">Achevé</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            {filtreStatut && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Statut: {getStatusLabel(filtreStatut)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setFiltres(prev => ({ ...prev, statut: undefined }));
                  onClearFilters();
                }} />
              </Badge>
            )}
            {filtreExercice && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Exercice: {filtreExercice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setFiltres(prev => ({ ...prev, exercice: undefined }));
                  onClearFilters();
                }} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercice</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Opération</TableHead>
                <TableHead>Cocontractant</TableHead>
                <TableHead className="text-right">Montant Engagé</TableHead>
                <TableHead className="text-right">Avancement</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetsPagines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucun projet trouvé
                  </TableCell>
                </TableRow>
              ) : (
                projetsPagines.map((projet) => (
                  <TableRow key={projet.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{projet.exercice}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={projet.programme}>
                      {projet.programme}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground">
                      {projet.operation || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {projet.cocontractant || '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(projet.contrat.montantEngage)}</TableCell>
                    <TableCell className="text-right">{formatPercent(projet.travaux.avancementNouveau)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(projet.paiement.cumulPaiement)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(projet.statut)}>
                        {getStatusLabel(projet.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteProject(projet)}
                          title="Supprimer"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Affichage de {projetsPagines.length} sur {projetsFiltres.length} projets
        </div>
      </CardContent>
    </Card>
  );
}
