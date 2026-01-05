import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  CalendarCheck,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { 
  getStatistics, 
  mockTrendData, 
  mockVerifikatorStats, 
  mockDomains 
} from '@/lib/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = getStatistics();

  const pieData = [
    { name: 'Judi Online', value: stats.judolCount, color: 'hsl(0, 84%, 60%)' },
    { name: 'Non Judi Online', value: stats.nonJudolCount, color: 'hsl(160, 84%, 39%)' },
  ];

  const recentDomains = mockDomains
    .filter(d => d.verifiedBy)
    .sort((a, b) => new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang, {user?.username}! Berikut ringkasan monitoring hari ini.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Update terakhir: {new Date().toLocaleTimeString('id-ID')}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total URL Crawled"
            value={stats.totalUrls}
            icon={Globe}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Terverifikasi Judi Online"
            value={stats.judolCount}
            icon={AlertTriangle}
            variant="danger"
            trend={{ value: 8, isPositive: false }}
          />
          <StatCard
            title="Non Judi Online"
            value={stats.nonJudolCount}
            icon={CheckCircle}
            variant="success"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Verifikasi Hari Ini"
            value={stats.todayVerified}
            icon={CalendarCheck}
            variant="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Temuan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="judol"
                    name="Judi Online"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 84%, 60%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nonJudol"
                    name="Non Judi Online"
                    stroke="hsl(160, 84%, 39%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(160, 84%, 39%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart - Top Verifikator */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Top Verifikator</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockVerifikatorStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Jumlah Verifikasi"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Verifications Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Verifikasi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Domain</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Verifikator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDomains.map((domain) => (
                      <tr key={domain.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium truncate max-w-[200px] block">
                            {domain.domain}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={domain.status === 'judol' ? 'badge-judol' : 'badge-non-judol'}>
                            {domain.status === 'judol' ? 'Judol' : 'Non Judol'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-semibold ${
                            domain.confidenceScore >= 80 
                              ? domain.status === 'judol' ? 'text-destructive' : 'text-success'
                              : 'text-warning'
                          }`}>
                            {domain.confidenceScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {domain.verifiedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
