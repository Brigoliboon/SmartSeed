"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, Package, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InventoryStats, SensorData } from '../../types';

export function DashboardPage() {
  const [stats, setStats] = useState<InventoryStats>({
    total_batches: 42,
    total_plants: 15678,
    ready_for_distribution: 3240,
    health_issues: 3,
    active_alerts: 2,
  });

  const [sensorData, setSensorData] = useState<SensorData[]>([]);

  useEffect(() => {
    // Generate mock sensor data for visualization
    const mockData: SensorData[] = [];
    const now = Date.now();
    
    for (let i = 24; i >= 0; i--) {
      mockData.push({
        id: `sensor-${i}`,
        sensor_id: 'SENSOR-001',
        batch_id: 'BATCH-001',
        temperature: 22 + Math.random() * 4,
        humidity: 65 + Math.random() * 10,
        soil_moisture: 55 + Math.random() * 15,
        light_level: 300 + Math.random() * 200,
        timestamp: new Date(now - i * 3600000).toISOString(),
      });
    }
    
    setSensorData(mockData);
  }, []);

  const chartData = sensorData.map((data) => ({
    time: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: Math.round(data.temperature * 10) / 10,
    humidity: Math.round(data.humidity * 10) / 10,
    moisture: Math.round(data.soil_moisture * 10) / 10,
  }));

  const statCards = [
    {
      title: 'Total Batches',
      value: stats.total_batches,
      icon: Package,
      trend: '+12% from last month',
      color: 'text-chart-1',
    },
    {
      title: 'Total Plants',
      value: stats.total_plants.toLocaleString(),
      icon: Activity,
      trend: '+8% from last month',
      color: 'text-chart-2',
    },
    {
      title: 'Ready for Distribution',
      value: stats.ready_for_distribution.toLocaleString(),
      icon: CheckCircle,
      trend: '+15% from last week',
      color: 'text-primary',
    },
    {
      title: 'Active Alerts',
      value: stats.active_alerts,
      icon: AlertCircle,
      trend: stats.active_alerts > 0 ? 'Requires attention' : 'All clear',
      color: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Monitor your nursery operations in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Environmental Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature & Humidity</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="var(--chart-1)" 
                  strokeWidth={2}
                  name="Temperature (°C)"
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="var(--chart-2)" 
                  strokeWidth={2}
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Soil Moisture Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Soil Moisture Levels</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="var(--chart-3)" 
                  fill="var(--chart-3)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Soil Moisture (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your nursery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'success', message: 'Batch MNG-2024-032 ready for distribution', time: '2 hours ago' },
              { type: 'warning', message: 'Low soil moisture detected in Zone B', time: '4 hours ago' },
              { type: 'info', message: 'AI scan completed for 15 new seedlings', time: '5 hours ago' },
              { type: 'success', message: 'Temperature stabilized in greenhouse 3', time: '6 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-primary' :
                  activity.type === 'warning' ? 'bg-destructive' :
                  'bg-chart-2'
                }`} />
                <div className="flex-1">
                  <p>{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
