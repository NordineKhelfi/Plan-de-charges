import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Wallet,
  PiggyBank,
  PauseCircle,
  Clock
} from 'lucide-react';
import type { Projet } from '@/types';
import { calculateStats, generateAlerts } from '@/data/projets';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardProps {
  projets: Projet[];
  onViewAlerts: () => void;
  onFilterByStatut: (statut: string) => void;
  onFilterByExercice: (exercice: number) => void;
}

const COLORS = {
  termine: '#10b981',
  en_cours: '#3b82f6',
  planifie: '#6b7280',
  en_pause: '#f97316',
  en_retard: '#ef4444',
  en_cours_resilition: '#64748b',
  resilie: '#475569',
  en_procedure: '#b45309',
};

export function Dashboard({ projets, onViewAlerts, onFilterByStatut, onFilterByExercice }: DashboardProps) {
  const stats = useMemo(() => calculateStats(projets), [projets]);
  const alerts = useMemo(() => generateAlerts(projets), [projets]);

  // Données pour le graphique des projets par statut
  const statutData = useMemo(() => {
    const data = [
      { name: 'Achevés', value: projets.filter(p => p.statut === 'termine').length, key: 'termine' },
      { name: 'En cours', value: projets.filter(p => p.statut === 'en_cours').length, key: 'en_cours' },
      { name: 'Non-lancés', value: projets.filter(p => p.statut === 'planifie').length, key: 'planifie' },
      { name: 'À l\'arrêt', value: projets.filter(p => p.statut === 'en_pause').length, key: 'en_pause' },
      { name: 'En retard', value: projets.filter(p => p.statut === 'en_retard').length, key: 'en_retard' },
    ];
    return data.filter(d => d.value > 0);
  }, [projets]);

  // Données pour le graphique des montants par exercice
  const montantsParExercice = useMemo(() => {
    const exercices = [...new Set(projets.map(p => p.exercice))].sort();
    return exercices.map(exercice => ({
      exercice: exercice.toString(),
      exerciceNum: exercice,
      engage: projets.filter(p => p.exercice === exercice).reduce((sum, p) => sum + p.contrat.montantEngage, 0),
      paye: projets.filter(p => p.exercice === exercice).reduce((sum, p) => sum + p.paiement.cumulPaiement, 0),
    }));
  }, [projets]);

  const handlePieClick = (data: { key: string }) => {
    if (data && data.key) {
      onFilterByStatut(data.key);
    }
  };

  const handleBarClick = (data: { exerciceNum: number }) => {
    if (data && data.exerciceNum) {
      onFilterByExercice(data.exerciceNum);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="border-l-4 border-l-blue-500 cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => onFilterByStatut('en_cours')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets En Cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.projetsEnCours)}</div>
            <p className="text-xs text-muted-foreground">
              Sur {formatNumber(stats.totalProjets)} projets au total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-green-500 cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => onFilterByStatut('termine')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Achevés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.projetsTermines)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.projetsTermines / stats.totalProjets) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-orange-500 cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => onFilterByStatut('en_pause')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets À l'arrêt</CardTitle>
            <PauseCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.projetsEnPause)}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-red-500 cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => onFilterByStatut('en_retard')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.projetsEnRetard)}</div>
            <p className="text-xs text-muted-foreground">
              Action urgente requise
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second row of KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total Engagé</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.montantTotalEngage)}</div>
            <p className="text-xs text-muted-foreground">
              Sur {formatNumber(stats.totalProjets)} projets
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total Payé</CardTitle>
            <PiggyBank className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.montantTotalPaye)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.montantTotalPaye / stats.montantTotalEngage) * 100).toFixed(1)}% du total engagé
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`border-l-4 cursor-pointer transition-colors hover:bg-muted/50 ${
            stats.alertesCritiques > 0 ? 'border-l-red-500' : 
            stats.alertesWarning > 0 ? 'border-l-amber-500' : 'border-l-green-500'
          }`}
          onClick={onViewAlerts}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            {stats.alertesCritiques > 0 ? (
              <AlertOctagon className="h-4 w-4 text-red-500" />
            ) : stats.alertesWarning > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.alertesCritiques + stats.alertesWarning}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.alertesCritiques} critiques, {stats.alertesWarning} avertissements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Projets par Statut</CardTitle>
            <p className="text-sm text-muted-foreground">Cliquez sur une section pour filtrer</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statutData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={handlePieClick}
                    cursor="pointer"
                  >
                    {statutData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.key as keyof typeof COLORS] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Montants par Exercice</CardTitle>
            <p className="text-sm text-muted-foreground">Cliquez sur une barre pour filtrer</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={montantsParExercice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exercice" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Exercice ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="engage" 
                    name="Montant Engagé" 
                    fill="#3b82f6" 
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                  <Bar 
                    dataKey="paye" 
                    name="Montant Payé" 
                    fill="#10b981" 
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes récentes */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.niveau === 'critique' 
                      ? 'bg-red-50 border-red-200' 
                      : alert.niveau === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alert.niveau === 'critique' ? (
                      <AlertOctagon className="h-4 w-4 text-red-500" />
                    ) : alert.niveau === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
