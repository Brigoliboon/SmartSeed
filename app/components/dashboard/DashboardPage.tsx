"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Activity, Package, Users, ClipboardList, Sprout, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InventoryStats, SensorData, User } from '../../types';
import { FieldWorkerDashboard } from './FieldWorkerDashboard';

interface DashboardPageProps {
  user: User;
}

export function DashboardPage({ user }: DashboardPageProps) {
  const router = useRouter();

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
      clickable: true,
      onClick: () => router.push('/beneficiaries'),
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: ClipboardList,
      trend: 'Awaiting approval',
      color: 'text-orange-600',
      clickable: true,
      onClick: () => router.push('/requests'),
    },
    {
      title: 'Growing Plants',
      value: growingPlants.toLocaleString(),
      icon: Sprout,
      trend: '+8% from last month',
      color: 'text-green-600',
      clickable: true,
      onClick: () => router.push('/plants'),
    },
    {
      title: 'Ready for Distribution',
      value: stats.ready_for_distribution.toLocaleString(),
      icon: TrendingUp,
      trend: '+15% from last week',
      color: 'text-primary',
      clickable: true,
      onClick: () => router.push('/distribution'),
    },
    {
      title: 'Total Batches',
      value: stats.total_batches,
      icon: Package,
      trend: '+12% from last month',
      color: 'text-chart-1',
      clickable: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Monitor your nursery operations in real-time</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
              onClick={stat.clickable ? stat.onClick : undefined}
            >
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

      {/* Nursery Locations Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nursery Locations</CardTitle>
              <CardDescription>Geographic distribution of nursery beds and sites</CardDescription>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="north">North Section</SelectItem>
                <SelectItem value="south">South Section</SelectItem>
                <SelectItem value="east">East Greenhouse</SelectItem>
                <SelectItem value="west">West Field</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
            {/* Realistic Map Layout */}
            <div className="absolute inset-0">
              <div className="relative w-full h-full bg-[#E5E3DF] dark:bg-gray-800">
                {/* Map road/path lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40">
                  {/* Horizontal roads */}
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#B8B5A9" strokeWidth="3" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#B8B5A9" strokeWidth="4" />
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#B8B5A9" strokeWidth="3" />
                  {/* Vertical roads */}
                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#B8B5A9" strokeWidth="3" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#B8B5A9" strokeWidth="4" />
                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#B8B5A9" strokeWidth="3" />
                </svg>

                {/* Green areas (fields/gardens) */}
                <div className="absolute top-[15%] left-[10%] w-32 h-24 bg-green-200/40 dark:bg-green-900/30 rounded" />
                <div className="absolute top-[55%] left-[28%] w-40 h-32 bg-green-300/40 dark:bg-green-800/30 rounded" />
                <div className="absolute top-[25%] left-[60%] w-36 h-28 bg-green-200/40 dark:bg-green-900/30 rounded" />
                <div className="absolute top-[40%] left-[5%] w-28 h-24 bg-green-300/40 dark:bg-green-800/30 rounded" />
                
                {/* Water/pond areas */}
                <div className="absolute top-[75%] right-[15%] w-24 h-20 bg-blue-200/50 dark:bg-blue-900/30 rounded-full" />
                
                {/* Location markers with pin/pointer icons */}
                <div className="absolute top-[25%] left-[30%] flex flex-col items-center group cursor-pointer">
                  {/* Pin icon SVG */}
                  <svg width="40" height="50" viewBox="0 0 24 30" className="drop-shadow-lg hover:scale-110 transition-transform">
                    <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#22c55e" />
                    <circle cx="12" cy="8" r="3" fill="white" />
                  </svg>
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg border">North Section</Badge>
                    <div className="text-xs text-center mt-1 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded shadow">
                      14.5995°N, 121.0857°E
                    </div>
                  </div>
                </div>

                <div className="absolute top-[60%] left-[35%] flex flex-col items-center group cursor-pointer">
                  {/* Pin icon SVG */}
                  <svg width="40" height="50" viewBox="0 0 24 30" className="drop-shadow-lg hover:scale-110 transition-transform">
                    <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#f97316" />
                    <circle cx="12" cy="8" r="3" fill="white" />
                  </svg>
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg border">South Section</Badge>
                    <div className="text-xs text-center mt-1 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded shadow">
                      14.5992°N, 121.0855°E
                    </div>
                  </div>
                </div>

                <div className="absolute top-[35%] left-[65%] flex flex-col items-center group cursor-pointer">
                  {/* Pin icon SVG */}
                  <svg width="40" height="50" viewBox="0 0 24 30" className="drop-shadow-lg hover:scale-110 transition-transform">
                    <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#a855f7" />
                    <circle cx="12" cy="8" r="3" fill="white" />
                  </svg>
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg border">East Greenhouse</Badge>
                    <div className="text-xs text-center mt-1 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded shadow">
                      14.5997°N, 121.0862°E
                    </div>
                  </div>
                </div>

                <div className="absolute top-[50%] left-[20%] flex flex-col items-center group cursor-pointer">
                  {/* Pin icon SVG */}
                  <svg width="40" height="50" viewBox="0 0 24 30" className="drop-shadow-lg hover:scale-110 transition-transform">
                    <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#3b82f6" />
                    <circle cx="12" cy="8" r="3" fill="white" />
                  </svg>
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg border">West Field</Badge>
                    <div className="text-xs text-center mt-1 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded shadow">
                      14.5990°N, 121.0850°E
                    </div>
                  </div>
                </div>

                {/* Compass Rose */}
                <div className="absolute top-4 left-4 w-16 h-16 opacity-60">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="white" stroke="#333" strokeWidth="2" opacity="0.9"/>
                    <text x="50" y="20" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">N</text>
                    <text x="50" y="88" textAnchor="middle" fontSize="12" fill="#666">S</text>
                    <text x="88" y="55" textAnchor="middle" fontSize="12" fill="#666">E</text>
                    <text x="12" y="55" textAnchor="middle" fontSize="12" fill="#666">W</text>
                    <path d="M 50 15 L 55 50 L 50 50 Z" fill="#e11d48"/>
                    <path d="M 50 85 L 45 50 L 50 50 Z" fill="#666"/>
                  </svg>
                </div>

                {/* Scale indicator */}
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-3 py-2 rounded shadow-lg">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-12 h-1 bg-black dark:bg-white border-t border-b border-black dark:border-white" />
                      <div className="w-12 h-1 bg-white dark:bg-black border-t border-b border-black dark:border-white" />
                    </div>
                    <span className="font-mono">100m</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/95 p-4 rounded-lg shadow-lg backdrop-blur-sm">
                  <h4 className="text-sm font-semibold mb-3">Nursery Sections</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="20" viewBox="0 0 24 30">
                        <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#22c55e" />
                        <circle cx="12" cy="8" r="3" fill="white" />
                      </svg>
                      <span>North Section (5 beds)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="20" viewBox="0 0 24 30">
                        <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#f97316" />
                        <circle cx="12" cy="8" r="3" fill="white" />
                      </svg>
                      <span>South Section (5 beds)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="20" viewBox="0 0 24 30">
                        <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#a855f7" />
                        <circle cx="12" cy="8" r="3" fill="white" />
                      </svg>
                      <span>East Greenhouse (5 beds)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="20" viewBox="0 0 24 30">
                        <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.411-3.589-8-8-8z" fill="#3b82f6" />
                        <circle cx="12" cy="8" r="3" fill="white" />
                      </svg>
                      <span>West Field (4 beds)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
