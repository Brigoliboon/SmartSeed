"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { User } from '../../types';
import { User as UserIcon, Bell, Shield, Globe } from 'lucide-react';

interface SettingsPageProps {
  user: User;
}

export function SettingsPage({ user }: SettingsPageProps) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    criticalAlerts: true,
    weeklyReports: false,
    batchUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Asia/Manila',
    theme: 'light',
  });

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', profile);
  };

  const handleSaveNotifications = () => {
    // TODO: Implement notification settings update
    console.log('Saving notifications:', notifications);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={profile.role.replace('_', ' ').toUpperCase()}
              disabled
              className="capitalize"
            />
            <p className="text-xs text-muted-foreground">
              Contact your administrator to change your role
            </p>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, push: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Critical Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Always notify for critical issues
              </p>
            </div>
            <Switch
              checked={notifications.criticalAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, criticalAlerts: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary reports
              </p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, weeklyReports: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Batch Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when batch status changes
              </p>
            </div>
            <Switch
              checked={notifications.batchUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, batchUpdates: checked })
              }
            />
          </div>

          <Separator />

          <Button onClick={handleSaveNotifications}>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>System Preferences</CardTitle>
          </div>
          <CardDescription>Configure application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value="English (US)"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Additional languages coming soon
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={preferences.timezone}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4>Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4>Active Sessions</h4>
            <p className="text-sm text-muted-foreground">
              Manage devices that are currently logged in
            </p>
            <Button variant="outline">View Sessions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
