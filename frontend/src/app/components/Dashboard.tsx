import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Warehouse,
  UserCheck,
  Wrench,
  AlertTriangle,
  Activity,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import * as dashboardService from '../../services/dashboardService';
import type { DashboardResumen, StockCritico, TicketActivo } from '../../services/dashboardService';

const COLORS = ['#4A5D23', '#7A8F3A', '#D91E18', '#5C6064'];

export function Dashboard() {
  const [resumen, setResumen] = useState<DashboardResumen[]>([]);
  const [stockCritico, setStockCritico] = useState<StockCritico[]>([]);
  const [tickets, setTickets] = useState<TicketActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [res, sc, tkt] = await Promise.all([
          dashboardService.getResumen(),
          dashboardService.getStockCritico(),
          dashboardService.getTicketsActivos(),
        ]);
        setResumen(res);
        setStockCritico(sc);
        setTickets(tkt);
      } catch {
        setError('No se pudo cargar el dashboard. Verifique la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#4A5D23] text-lg font-medium uppercase tracking-wider">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border-l-4 border-[#D91E18] p-4 max-w-md">
          <p className="text-[#D91E18] font-semibold">Error</p>
          <p className="text-sm text-[#D91E18] mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ── computed stats ──────────────────────────────────────────────────────────
  const totalBodega = resumen.reduce((s, r) => s + r.enBodega, 0);
  const totalAsignados = resumen.reduce((s, r) => s + r.asignados, 0);
  const totalReparacion = resumen.reduce((s, r) => s + r.enReparacion, 0);
  const totalBaja = resumen.reduce((s, r) => s + r.dadosDeBaja, 0);
  const tiposEnAlerta = stockCritico.filter((s) => s.enAlerta).length;

  const statsCards = [
    { icon: Package, label: 'Equipos Totales', value: resumen.reduce((s, r) => s + r.total, 0).toLocaleString(), color: '#4A5D23' },
    { icon: Warehouse, label: 'En Bodega', value: totalBodega.toLocaleString(), color: '#5C6064' },
    { icon: UserCheck, label: 'Asignados', value: totalAsignados.toLocaleString(), color: '#7A8F3A' },
    { icon: Wrench, label: 'En Reparación', value: totalReparacion.toLocaleString(), color: '#D91E18' },
    { icon: AlertTriangle, label: 'Tickets Activos', value: tickets.length.toString(), color: '#D91E18' },
    { icon: Activity, label: 'Stock Crítico', value: tiposEnAlerta.toString(), color: tiposEnAlerta > 0 ? '#D91E18' : '#4A5D23' },
  ];

  // ── chart data ──────────────────────────────────────────────────────────────
  const equiposPorTipo = resumen.map((r) => ({ area: r.nombreTipo, cantidad: r.total }));

  const incidentesPorTipo = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.tipoIncidente] = (acc[t.tipoIncidente] || 0) + 1;
      return acc;
    }, {})
  ).map(([tipo, cantidad]) => ({ tipo, cantidad }));

  const estadoInventario = [
    { name: 'En Bodega', value: totalBodega },
    { name: 'Asignados', value: totalAsignados },
    { name: 'En Reparación', value: totalReparacion },
    { name: 'Dado de Baja', value: totalBaja },
  ].filter((d) => d.value > 0);

  const stockChart = stockCritico.map((s) => ({
    tipo: s.nombreTipo,
    pctActual: Number(s.pctActual),
    umbral: s.umbralPct,
    enAlerta: s.enAlerta,
  }));

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: stat.color }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-sm bg-[#F5F5F0]">
                      <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                  <p className="text-[#2C3E1F]" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-t-4 border-t-[#4A5D23]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4A5D23]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Equipos por Tipo
                </CardTitle>
              </div>
              <CardDescription>Distribución de equipos por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={equiposPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#4A5D23" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incidents by Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-t-4 border-t-[#D91E18]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D91E18]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Tickets por Tipo de Incidente
                </CardTitle>
              </div>
              <CardDescription>Categorización de tickets activos</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentesPorTipo.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-[#5C6064]">
                  No hay tickets activos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentesPorTipo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="tipo" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#D91E18" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-t-4 border-t-[#5C6064]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#5C6064]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Estado de Inventario
                </CardTitle>
              </div>
              <CardDescription>Distribución actual del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadoInventario}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadoInventario.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Operativo por Tipo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-t-4 border-t-[#7A8F3A]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#7A8F3A]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Stock Operativo por Tipo
                </CardTitle>
              </div>
              <CardDescription>% operativo vs umbral mínimo por tipo de equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => [`${value}%`]} />
                  <Legend />
                  <Bar dataKey="pctActual" name="% Operativo" radius={[4, 4, 0, 0]} fill="#4A5D23" />
                  <Bar dataKey="umbral" name="Umbral mínimo" radius={[4, 4, 0, 0]} fill="#D91E18" fillOpacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Tickets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-t-4 border-t-[#4A5D23]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4A5D23]" />
              <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                Tickets Activos Recientes
              </CardTitle>
            </div>
            <CardDescription>Últimos tickets abiertos o en proceso con estado de SLA</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-center text-[#5C6064] py-8">No hay tickets activos</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => {
                  const isUrgent = ticket.slaVencido || ticket.fueraDeSla;
                  const borderColor = isUrgent ? '#D91E18' : ticket.estado === 'ABIERTO' ? '#D91E18' : '#4A5D23';
                  return (
                    <div
                      key={ticket.idTicket}
                      className="flex items-start gap-3 p-3 rounded-sm hover:bg-[#F5F5F0] transition-colors border-l-2"
                      style={{ borderLeftColor: borderColor }}
                    >
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: borderColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                          {ticket.numeroTicket} — {ticket.tipoIncidente}
                        </p>
                        <p className="text-sm text-[#5C6064]">
                          {ticket.codigoEjercito} · {ticket.nombreArea} · {ticket.tecnico}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded ${ticket.slaVencido ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {ticket.slaVencido ? 'SLA vencido' : `${ticket.minutosRestantesSla} min SLA`}
                        </span>
                        <p className="text-xs text-[#5C6064] mt-1">{ticket.estado}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
