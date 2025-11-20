"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Bell, BellOff } from 'lucide-react';
import { Alert } from '../../types';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Bed Capacity Exceeded',
      message: 'BED-002 (North Section) has exceeded its maximum capacity of 358 seedlings. Current occupancy: 385. Immediate redistribution required.',
      batch_id: 'WLD-202410-001',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'Ornamental species inventory is running low. Only 1,200 seedlings available. Consider planning new batch collection.',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'critical',
      title: 'Pending Request Requires Attention',
      message: 'Seedling request from San Isidro Farmers Association has been pending for 5 days. Approval deadline approaching.',
      batch_id: 'REQ-001',
      is_read: false,
      created_at: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: '4',
      type: 'info',
      title: 'Batch Ready for Distribution',
      message: 'WLD-202404-008 (Narra - 650 seedlings) has reached maturity and is ready for distribution to beneficiaries.',
      batch_id: 'WLD-202404-008',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '5',
      type: 'warning',
      title: 'Incomplete Daily Tasks',
      message: 'BED-005 (North Section) has 3 pending tasks from today: Watering, Weeding, and Pest Check. Assigned to Juan Dela Cruz.',
      is_read: false,
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: '6',
      type: 'info',
      title: 'New Beneficiary Registration',
      message: 'Isabel Santiago from Binangonan SK Federation has registered as a new beneficiary. Total beneficiaries: 387.',
      is_read: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: '7',
      type: 'warning',
      title: 'Bed Requires Maintenance',
      message: 'BED-018 (West Field) showing poor drainage. Water pooling detected. Maintenance required before next planting.',
      is_read: false,
      created_at: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: '8',
      type: 'critical',
      title: 'Distribution Deadline Approaching',
      message: 'Approved request for Barangay Pililla LGU (400 Calamansi seedlings) must be fulfilled within 48 hours. Reserved stock available in BED-008.',
      batch_id: 'WLD-202404-012',
      is_read: true,
      created_at: new Date(Date.now() - 43200000).toISOString(),
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '9',
      type: 'warning',
      title: 'Multiple Beds Below 50% Capacity',
      message: 'BED-005, BED-013, and BED-018 are operating below 50% capacity. Consider consolidating or planning new batches.',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '10',
      type: 'info',
      title: 'Monthly Report Generated',
      message: 'October 2024 nursery report generated: 2,500 seedlings distributed, 387 active beneficiaries, 95% task completion rate.',
      is_read: true,
      created_at: new Date(Date.now() - 129600000).toISOString(),
      resolved_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '11',
      type: 'info',
      title: 'Batch Collection Successful',
      message: 'New wildling batch WLD-202410-015 successfully collected from Sierra Madre. 800 Mahogany seedlings received and assigned to BED-002.',
      batch_id: 'WLD-202410-015',
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      resolved_at: new Date(Date.now() - 129600000).toISOString(),
    },
    {
      id: '12',
      type: 'warning',
      title: 'Field Worker Task Load High',
      message: 'Maria Santos has 15 pending tasks across 6 beds. Consider redistributing workload to maintain quality.',
      is_read: true,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      resolved_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '13',
      type: 'info',
      title: 'Request Approved',
      message: 'Seedling distribution request from Green Tanay Movement (150 Santan) has been approved. Scheduled release: November 5, 2024.',
      batch_id: 'REQ-003',
      is_read: true,
      created_at: new Date(Date.now() - 345600000).toISOString(),
      resolved_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ]);

  const unreadAlerts = alerts.filter(a => !a.is_read);
  const readAlerts = alerts.filter(a => a.is_read);
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.is_read);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warning':
        return 'text-chart-3 bg-chart-3/10 border-chart-3/20';
      case 'info':
        return 'text-chart-2 bg-chart-2/10 border-chart-2/20';
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, is_read: true, resolved_at: new Date().toISOString() } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({
      ...alert,
      is_read: true,
      resolved_at: alert.resolved_at || new Date().toISOString()
    })));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <div className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4>{alert.title}</h4>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
            {!alert.is_read && (
              <Badge variant="outline" className="capitalize whitespace-nowrap">
                {alert.type}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs opacity-75">
            <span>{formatTimeAgo(alert.created_at)}</span>
            {alert.batch_id && <span>Batch: {alert.batch_id}</span>}
            {alert.sensor_id && <span>Sensor: {alert.sensor_id}</span>}
          </div>
          {!alert.is_read && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAsRead(alert.id)}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Mark as Resolved
              </Button>
            </div>
          )}
          {alert.resolved_at && (
            <p className="text-xs opacity-75">
              Resolved {formatTimeAgo(alert.resolved_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="text-muted-foreground">Stay updated on important events and conditions</p>
        </div>
        {unreadAlerts.length > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <BellOff className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Alerts</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {unreadAlerts.length} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Critical Alerts</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Resolved Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{readAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully addressed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>View and manage system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unread" className="space-y-4">
            <TabsList>
              <TabsTrigger value="unread">
                Unread ({unreadAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({readAlerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-3">
              {unreadAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No unread alerts</p>
                </div>
              ) : (
                unreadAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-3">
              {readAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resolved alerts</p>
                </div>
              ) : (
                readAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
