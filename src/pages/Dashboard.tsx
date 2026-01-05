import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDomains } from "@/contexts/DomainsContext";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import {
  Globe,
  AlertTriangle,
  CheckCircle,
  CalendarCheck,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getStatistics, getTrendData, getVerifikatorStats, getRecentVerifications } = useDomains();
  
  const stats = getStatistics();
  const trendData = getTrendData();
  const verifikatorStats = getVerifikatorStats();
  const recentDomains = getRecentVerifications(5);

  const pieData = [
    { name: "Judi Online", value: stats.judolCount, color: "hsl(0, 84%, 60%)" },
    {
      name: "Non Judi Online",
      value: stats.nonJudolCount,
      color: "hsl(160, 84%, 39%)",
    },
  ];

  return (
    <Layout>
      <div id="dashboard-page" className="space-y-6">
        {/* Header */}
        <div id="dashboard-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 id="dashboard-title" className="text-2xl lg:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p id="dashboard-subtitle" className="text-muted-foreground mt-1">
              Selamat datang, {user?.username}! Berikut ringkasan monitoring
              hari ini.
            </p>
          </div>
          <div id="dashboard-last-update" className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Update terakhir: {new Date().toLocaleTimeString("id-ID")}
          </div>
        </div>

        {/* Stats Cards */}
        <div id="stats-cards-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total URL Crawled"
            value={stats.totalUrls}
            icon={Globe}
            variant="primary"
          />
          <StatCard
            title="Total Domain"
            value={stats.totalDomains}
            icon={Layers}
            variant="primary"
          />
          <StatCard
            title="Terverifikasi Judi Online"
            value={stats.judolCount}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title="Non Judi Online"
            value={stats.nonJudolCount}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Verifikasi Hari Ini"
            value={stats.todayVerified}
            icon={CalendarCheck}
            variant="warning"
          />
        </div>

        {/* Charts Row */}
        <div id="charts-row" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Trend */}
          <Card id="trend-chart-card">
            <CardHeader>
              <CardTitle id="trend-chart-title" className="text-lg">Tren Temuan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer id="trend-chart-container" width="100%" height={280}>
                <LineChart id="trend-line-chart" data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="judol"
                    name="Judi Online"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 84%, 60%)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nonJudol"
                    name="Non Judi Online"
                    stroke="hsl(160, 84%, 39%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(160, 84%, 39%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribution */}
          <Card id="distribution-chart-card">
            <CardHeader>
              <CardTitle id="distribution-chart-title" className="text-lg">Distribusi Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer id="distribution-chart-container" width="100%" height={280}>
                <PieChart id="distribution-pie-chart">
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div id="bottom-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart - Top Verifikator */}
          <Card id="top-verifikator-card" className="lg:col-span-1">
            <CardHeader>
              <CardTitle id="top-verifikator-title" className="text-lg">Top Verifikator</CardTitle>
            </CardHeader>
            <CardContent>
              {verifikatorStats.length > 0 ? (
                <ResponsiveContainer id="verifikator-chart-container" width="100%" height={240}>
                  <BarChart id="verifikator-bar-chart" data={verifikatorStats} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
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
              ) : (
                <div id="no-verifikator-data" className="flex items-center justify-center h-[240px] text-muted-foreground">
                  Belum ada data verifikator
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Verifications Table */}
          <Card id="recent-verifications-card" className="lg:col-span-2">
            <CardHeader>
              <CardTitle id="recent-verifications-title" className="text-lg">Verifikasi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {recentDomains.length > 0 ? (
                  <table id="recent-verifications-table" className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th id="th-domain" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Domain
                        </th>
                        <th id="th-status" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th id="th-score" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Score
                        </th>
                        <th id="th-verifikator" className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Verifikator
                        </th>
                      </tr>
                    </thead>
                    <tbody id="recent-verifications-tbody">
                      {recentDomains.map((domain) => (
                        <tr
                          key={domain.id}
                          id={`recent-verification-row-${domain.id}`}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td id={`recent-domain-${domain.id}`} className="py-3 px-4">
                            <span className="text-sm font-medium truncate max-w-[200px] block">
                              {domain.domain}
                            </span>
                          </td>
                          <td id={`recent-status-${domain.id}`} className="py-3 px-4">
                            <Badge
                              className={
                                domain.status === "judol"
                                  ? "badge-judol"
                                  : "badge-non-judol"
                              }
                            >
                              {domain.status === "judol" ? "Judol" : "Non Judol"}
                            </Badge>
                          </td>
                          <td id={`recent-score-${domain.id}`} className="py-3 px-4">
                            <span
                              className={`text-sm font-semibold ${
                                domain.confidenceScore >= 80
                                  ? domain.status === "judol"
                                    ? "text-destructive"
                                    : "text-success"
                                  : "text-warning"
                              }`}
                            >
                              {domain.confidenceScore}%
                            </span>
                          </td>
                          <td id={`recent-verifikator-${domain.id}`} className="py-3 px-4 text-sm text-muted-foreground">
                            {domain.verifiedBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div id="no-recent-verifications" className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Belum ada data verifikasi
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
