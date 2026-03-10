import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAnalytics } from "@/services/api";
import type { AnalyticsData } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, Clock, FileText } from "lucide-react";

const COLORS = ["hsl(0,72%,51%)", "hsl(38,92%,50%)", "hsl(215,70%,40%)", "hsl(160,84%,30%)"];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => { getAnalytics().then(setData); }, []);

  if (!data) return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;

  const stats = [
    { label: "Total Requests", value: data.totalRequests, icon: FileText, color: "text-primary" },
    { label: "Active NGOs", value: data.activeNgos, icon: Users, color: "text-info" },
    { label: "Avg Response (hrs)", value: data.avgResponseTime, icon: Clock, color: "text-warning" },
    { label: "Completion Rate", value: "76%", icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Requests by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.categoryBreakdown} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Monthly Requests</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.monthlyRequests}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(160,84%,30%)" strokeWidth={2} dot={{ fill: "hsl(160,84%,30%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Requests by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(160,84%,30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
