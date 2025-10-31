"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, Package, Users, ClipboardList, Sprout, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InventoryStats, SensorData, User } from '../../types';
import { FieldWorkerDashboard } from './FieldWorkerDashboard';

interface DashboardPageProps {
  user: User;
}

export function DashboardPage({ user }: DashboardPageProps) {
  // Show field worker dashboard for field workers
  if (user.role === 'field_worker') {
    return <FieldWorkerDashboard userId={parseInt(user.id)} />;
  }

  // Admin dashboard below
  const [stats, setStats] = useState<InventoryStats>({
    total_batches: 42,
    total_plants: 15678,
    ready_for_distribution: 3240,
    health_issues: 3,
    active_alerts: 2,
  });

  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [growingPlants, setGrowingPlants] = useState(0);

  // Graph data states
  const [plantGrowthData, setPlantGrowthData] = useState<any[]>([]);
  const [speciesDistribution, setSpeciesDistribution] = useState<any[]>([]);
  const [taskCompletionData, setTaskCompletionData] = useState<any[]>([]);
  const [bedCapacityData, setBedCapacityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Realistic dummy data for nursery dashboard
      
      // 1. Plant Growth Data (last 30 days)
      const growthData = [];
      const today = new Date();
      let cumulativePlants = 12000;
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Add realistic growth (50-200 plants per day with some variation)
        cumulativePlants += Math.floor(Math.random() * 150) + 50;
        growthData.push({
          date: dateStr,
          plants: cumulativePlants
        });
      }
      setPlantGrowthData(growthData);
      
      // 2. Species Distribution (realistic nursery categories)
      setSpeciesDistribution([
        { name: 'Forestry', value: 8500, percent: 0.54, color: '#22c55e' },
        { name: 'Fruit Trees', value: 4200, percent: 0.27, color: '#f97316' },
        { name: 'Ornamental', value: 3000, percent: 0.19, color: '#a855f7' }
      ]);
      
      // 3. Bed Capacity Data (6 beds with varying capacity)
      setBedCapacityData([
        { bed: 'Bed A1', current: 350, capacity: 500 },
        { bed: 'Bed A2', current: 480, capacity: 500 },
        { bed: 'Bed B1', current: 650, capacity: 800 },
        { bed: 'Bed B2', current: 420, capacity: 600 },
        { bed: 'Bed C1', current: 290, capacity: 400 },
        { bed: 'Bed C2', current: 180, capacity: 300 }
      ]);
      
      // 4. Task Completion Data (last 7 days)
      const taskData = [];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 6; i >= 0; i--) {
        const dayIndex = (today.getDay() - i + 7) % 7;
        taskData.push({
          day: days[dayIndex],
          completed: Math.floor(Math.random() * 20) + 25, // 25-45 completed
          pending: Math.floor(Math.random() * 10) + 5    // 5-15 pending
        });
      }
      setTaskCompletionData(taskData);
      
      // 5. Summary Stats
      const totalPlants = cumulativePlants;
      setStats({
        total_batches: 28,
        total_plants: totalPlants,
        ready_for_distribution: 3840,
        health_issues: 2,
        active_alerts: 1,
      });
      
      setGrowingPlants(totalPlants - 3840); // Growing = total - ready
      setTotalBeneficiaries(387);
      setPendingRequests(12);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };



  const statCards = [
    {
      title: 'Total Beneficiaries',
      value: totalBeneficiaries.toLocaleString(),
      icon: Users,
      trend: '+23 new this month',
      color: 'text-blue-600',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: ClipboardList,
      trend: 'Awaiting approval',
      color: 'text-orange-600',
    },
    {
      title: 'Growing Plants',
      value: growingPlants.toLocaleString(),
      icon: Sprout,
      trend: '+8% from last month',
      color: 'text-green-600',
    },
    {
      title: 'Ready for Distribution',
      value: stats.ready_for_distribution.toLocaleString(),
      icon: TrendingUp,
      trend: '+15% from last week',
      color: 'text-primary',
    },
    {
      title: 'Total Batches',
      value: stats.total_batches,
      icon: Package,
      trend: '+12% from last month',
      color: 'text-chart-1',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Monitor your nursery operations in real-time</p>
      </div>

      {/* Stats Grid - Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4 min-w-max">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="min-w-[280px]">
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
      </div>

      {/* Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Plant Inventory Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Plant Inventory Growth</CardTitle>
            <CardDescription>Cumulative plant count over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={plantGrowthData}>
                  <defs>
                    <linearGradient id="colorPlants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="plants" 
                    stroke="#22c55e" 
                    fill="url(#colorPlants)"
                    strokeWidth={2}
                    name="Total Plants"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 2. Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Species Distribution</CardTitle>
            <CardDescription>Plants by category across all beds</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : speciesDistribution.length === 0 || speciesDistribution.every(d => d.value === 0) ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <p>No plant data available</p>
                <p className="text-sm">Add batches to beds to see distribution</p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={speciesDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }: any) => {
                        if (value === 0) return '';
                        return `${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={90}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {speciesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: any) => [`${value} plants`, '']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Bed Capacity Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Bed Capacity Utilization</CardTitle>
            <CardDescription>Current occupancy vs maximum capacity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bedCapacityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <YAxis 
                    dataKey="bed" 
                    type="category" 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Current') return [value, 'Current Occupancy'];
                      if (name === 'Capacity') return [value, 'Max Capacity'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#22c55e" name="Current" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 4. Daily Task Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
            <CardDescription>Completed vs pending tasks (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#f97316" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
