import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bell, 
  Menu,
  LogOut,
  FileText,
  Plus,
  Edit3,
  List
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { ProjectList } from '@/components/ProjectList';
import { ProjectDetail } from '@/components/ProjectDetail';
import { ProjectForm } from '@/components/ProjectForm';
import { AlertsPanel } from '@/components/AlertsPanel';
import { EtatSortie } from '@/components/EtatSortie';
import { 
  getProjets, 
  addProjet, 
  updateProjet, 
  deleteProjet,
  calculateStats 
} from '@/data/projets';
import { saveProjectsToStorage } from '@/lib/storage';
import type { Projet } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type View = 'dashboard' | 'projects' | 'alerts' | 'detail' | 'form' | 'etat-sortie';

function App() {
  const [projets, setProjets] = useState<Projet[]>(getProjets());
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProjet, setSelectedProjet] = useState<Projet | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projetToDelete, setProjetToDelete] = useState<Projet | undefined>();
  
  // Filtres pour la liste des projets
  const [filtreStatut, setFiltreStatut] = useState<string | undefined>();
  const [filtreExercice, setFiltreExercice] = useState<number | undefined>();

  const stats = calculateStats(projets);

  const handleViewProject = (projet: Projet) => {
    setSelectedProjet(projet);
    setCurrentView('detail');
  };

  const handleEditProject = (projet: Projet) => {
    setSelectedProjet(projet);
    setCurrentView('form');
  };

  const handleAddProject = () => {
    setSelectedProjet(undefined);
    setCurrentView('form');
  };

  const handleSaveProject = (projetData: Projet | Omit<Projet, 'id' | 'dateCreation' | 'dateModification'>) => {
    if ('id' in projetData) {
      // Update existing
      const updated = updateProjet(projetData.id, projetData);
      if (updated) {
        setProjets(getProjets());
        saveProjectsToStorage(getProjets());
        toast.success('Projet modifié avec succès');
        setCurrentView('projects');
      }
    } else {
      // Create new
      addProjet(projetData);
      setProjets(getProjets());
      saveProjectsToStorage(getProjets());
      toast.success('Projet créé avec succès');
      setCurrentView('projects');
    }
  };

  const handleDeleteClick = (projet: Projet) => {
    setProjetToDelete(projet);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projetToDelete) {
      deleteProjet(projetToDelete.id);
      setProjets(getProjets());
      saveProjectsToStorage(getProjets());
      toast.success('Projet supprimé avec succès');
      setDeleteDialogOpen(false);
      setProjetToDelete(undefined);
      if (currentView === 'detail') {
        setCurrentView('projects');
      }
    }
  };

  const handleFilterByStatut = (statut: string) => {
    setFiltreStatut(statut);
    setFiltreExercice(undefined);
    setCurrentView('projects');
  };

  const handleFilterByExercice = (exercice: number) => {
    setFiltreExercice(exercice);
    setFiltreStatut(undefined);
    setCurrentView('projects');
  };

  const handleRefresh = () => {
    setProjets(getProjets());
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            projets={projets} 
            onViewAlerts={() => setCurrentView('alerts')} 
            onFilterByStatut={handleFilterByStatut}
            onFilterByExercice={handleFilterByExercice}
          />
        );
      case 'projects':
        return (
          <ProjectList
            projets={projets}
            filtreStatut={filtreStatut}
            filtreExercice={filtreExercice}
            onViewProject={handleViewProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteClick}
            onAddProject={handleAddProject}
            onClearFilters={() => {
              setFiltreStatut(undefined);
              setFiltreExercice(undefined);
            }}
            onProjectsImported={(newProjects) => {
              saveProjectsToStorage(newProjects);
              setProjets(newProjects);
            }}
          />
        );
      case 'alerts':
        return (
          <AlertsPanel
            projets={projets}
            onBack={() => setCurrentView('dashboard')}
            onViewProject={handleViewProject}
          />
        );
      case 'etat-sortie':
        return (
          <EtatSortie
            projets={projets}
            onViewProject={handleViewProject}
            onEditProject={handleEditProject}
            onRefresh={handleRefresh}
          />
        );
      case 'detail':
        return selectedProjet ? (
          <ProjectDetail
            projet={selectedProjet}
            onBack={() => setCurrentView('projects')}
            onEdit={handleEditProject}
          />
        ) : null;
      case 'form':
        return (
          <ProjectForm
            projet={selectedProjet}
            onSave={handleSaveProject}
            onCancel={() => setCurrentView(selectedProjet ? 'detail' : 'projects')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Plan de Charges</h1>
              <p className="text-xs text-slate-400">Gestion des Projets</p>
            </div>
          </div>

          {/* Menu Principal */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Menu Principal
            </p>
            <nav className="space-y-1">
              <Button
                variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Tableau de bord
              </Button>
              <Button
                variant={currentView === 'projects' || currentView === 'detail' || currentView === 'form' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setFiltreStatut(undefined);
                  setFiltreExercice(undefined);
                  setCurrentView('projects');
                }}
              >
                <List className="h-5 w-5 mr-3" />
                Liste des Projets
              </Button>
              <Button
                variant={currentView === 'etat-sortie' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('etat-sortie')}
              >
                <FileText className="h-5 w-5 mr-3" />
                État de Sortie
              </Button>
            </nav>
          </div>

          {/* Gestion */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Gestion
            </p>
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleAddProject}
              >
                <Plus className="h-5 w-5 mr-3" />
                Nouveau Programme
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Edit3 className="h-5 w-5 mr-3" />
                    Modifier Programme
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Sélectionner un programme à modifier</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 mt-4">
                    {projets.slice(0, 10).map((projet) => (
                      <Button
                        key={projet.id}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          handleEditProject(projet);
                        }}
                      >
                        <span className="truncate">{projet.programme}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {projet.exercice}
                        </span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant={currentView === 'alerts' ? 'secondary' : 'ghost'}
                className="w-full justify-start relative"
                onClick={() => setCurrentView('alerts')}
              >
                <Bell className="h-5 w-5 mr-3" />
                Alertes
                {(stats.alertesCritiques + stats.alertesWarning) > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.alertesCritiques + stats.alertesWarning}
                  </span>
                )}
              </Button>
            </nav>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="font-semibold">MO</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Maître d'Ouvrage</p>
              <p className="text-xs text-slate-400">Administrateur</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-semibold">Plan de Charges</span>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet "{projetToDelete?.programme}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjetToDelete(undefined)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
