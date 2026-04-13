import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2,
  Bell,
  ArrowLeft
} from 'lucide-react';
import type { Projet, Alert } from '@/types';
import { generateAlerts } from '@/data/projets';
import { useMemo } from 'react';

interface AlertsPanelProps {
  projets: Projet[];
  onBack: () => void;
  onViewProject: (projet: Projet) => void;
}

export function AlertsPanel({ projets, onBack, onViewProject }: AlertsPanelProps) {
  const alerts = useMemo(() => generateAlerts(projets), [projets]);

  const getProjetById = (id: string) => projets.find(p => p.id === id);

  const alertsByType = {
    critique: alerts.filter(a => a.niveau === 'critique'),
    warning: alerts.filter(a => a.niveau === 'warning'),
    info: alerts.filter(a => a.niveau === 'info'),
  };

  const renderAlertCard = (alert: Alert) => {
    const projet = getProjetById(alert.projetId);
    if (!projet) return null;

    return (
      <div 
        key={alert.id}
        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:shadow-md ${
          alert.niveau === 'critique' 
            ? 'bg-red-50 border-red-200 hover:bg-red-100' 
            : alert.niveau === 'warning'
            ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
        }`}
        onClick={() => onViewProject(projet)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {alert.niveau === 'critique' ? (
              <AlertOctagon className="h-5 w-5 text-red-600" />
            ) : alert.niveau === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            ) : (
              <Info className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant={alert.niveau === 'critique' ? 'destructive' : alert.niveau === 'warning' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {alert.niveau.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {alert.type === 'delai' ? 'Délai' : 
                 alert.type === 'avance' ? 'Avance' : 
                 alert.type === 'avancement' ? 'Avancement' : 'Publication'}
              </span>
            </div>
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Projet: {projet.programme}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Alertes et Notifications
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
            <AlertOctagon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsByType.critique.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsByType.warning.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informations</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsByType.info.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune alerte</h3>
            <p className="text-muted-foreground">Tous les projets sont en règle</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {alertsByType.critique.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-red-500" />
                Alertes Critiques
              </h2>
              <div className="space-y-2">
                {alertsByType.critique.map(renderAlertCard)}
              </div>
            </div>
          )}

          {alertsByType.warning.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Avertissements
              </h2>
              <div className="space-y-2">
                {alertsByType.warning.map(renderAlertCard)}
              </div>
            </div>
          )}

          {alertsByType.info.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Informations
              </h2>
              <div className="space-y-2">
                {alertsByType.info.map(renderAlertCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
