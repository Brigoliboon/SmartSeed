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
      title: 'Critical Temperature Alert',
      message: 'Temperature in Greenhouse A-2 has exceeded safe limits (34°C). Immediate action required.',
      batch_id: 'BATCH-002',
      sensor_id: 'SENSOR-A2',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Soil Moisture',
      message: 'Soil moisture in Zone B has dropped to 45%. Consider increasing irrigation frequency.',
      batch_id: 'BATCH-003',
      sensor_id: 'SENSOR-B1',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      type: 'info',
      title: 'Batch Ready for Distribution',
      message: 'Batch MNG-2024-001 (Mahogany) has reached maturity and is ready for distribution.',
      batch_id: 'BATCH-001',
      is_read: false,
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: '4',
      type: 'warning',
      title: 'Humidity Fluctuation',
      message: 'Humidity levels in Greenhouse C-1 showing irregular patterns. Check ventilation system.',
      sensor_id: 'SENSOR-C1',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '5',
      type: 'info',
      title: 'Scan Complete',
      message: 'AI scan completed for 25 seedlings in Batch MNG-2024-004. All plants showing healthy growth.',
      batch_id: 'BATCH-004',
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      resolved_at: new Date(Date.now() - 86400000).toISOString(),
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
