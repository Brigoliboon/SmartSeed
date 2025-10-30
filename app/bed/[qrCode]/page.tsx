"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, MapPin, Layers, User, Sprout, Clock, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Task {
  task_id: number;
  task_name: string;
  task_description: string;
  is_completed: boolean;
  completion_data: any;
}

interface Bed {
  bed_id: number;
  bed_name: string;
  location_name: string;
  species_category: string;
  person_in_charge_name: string;
  qr_code: string;
}

export default function BedTasksPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;

  const [bed, setBed] = useState<Bed | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    // Check if user name is stored
    const storedName = localStorage.getItem('field_worker_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      setShowNameInput(true);
    }

    fetchTasks();
  }, [qrCode]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/tasks/bed/${qrCode}`);
      const data = await response.json();

      if (data.success) {
        setBed(data.bed);
        setTasks(data.tasks);
      } else {
        setError('Invalid QR code or bed not found');
      }
    } catch (err) {
      setError('Error loading tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (userName.trim()) {
      localStorage.setItem('field_worker_name', userName.trim());
      setShowNameInput(false);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    if (showNameInput || !userName) {
      setShowNameInput(true);
      return;
    }

    setUpdating(task.task_id);
    setError('');

    try {
      if (task.is_completed) {
        // Unmark task
        const response = await fetch('/api/tasks/complete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_id: bed?.bed_id,
            task_id: task.task_id
          })
        });

        if (response.ok) {
          await fetchTasks();
        }
      } else {
        // Mark as completed - use a temporary user ID
        const response = await fetch('/api/tasks/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_id: bed?.bed_id,
            task_id: task.task_id,
            completed_by: 999, // Temporary ID for public access
            notes: `Completed by: ${userName}`
          })
        });

        if (response.ok) {
          await fetchTasks();
        }
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.is_completed);
  const completedCount = tasks.filter(t => t.is_completed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={fetchTasks} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SmartSeed Nursery</h1>
                <p className="text-sm text-muted-foreground">Daily Task Checklist</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Name Input Card */}
        {showNameInput && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please enter your name before completing tasks:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  autoFocus
                />
                <Button onClick={handleNameSubmit} disabled={!userName.trim()}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bed Information */}
        {bed && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{bed.bed_name}</CardTitle>
                <Badge className="capitalize bg-green-100 text-green-800 border-green-200">
                  {bed.species_category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{bed.location_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">In charge: {bed.person_in_charge_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono text-xs bg-muted px-2 py-1 rounded">
                  {bed.qr_code}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        <Card className={allTasksCompleted ? 'border-green-500 bg-green-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Progress</p>
                <p className="text-3xl font-bold">
                  {completedCount} / {tasks.length}
                </p>
                <p className="text-sm text-muted-foreground">tasks completed</p>
              </div>
              {allTasksCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all bg-gradient-to-r from-green-500 to-emerald-600"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
            {allTasksCompleted && (
              <p className="text-green-700 font-medium text-center mt-4">
                ✨ All tasks completed! Great work!
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        {userName && !showNameInput && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Working as: {userName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    localStorage.removeItem('field_worker_name');
                    setUserName('');
                    setShowNameInput(true);
                  }}
                  className="text-blue-600"
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Checklist */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.task_id}
              className={`cursor-pointer transition-all ${
                task.is_completed ? 'bg-green-50 border-green-200' : 'hover:shadow-lg border-2'
              }`}
              onClick={() => updating === null && handleTaskToggle(task)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.is_completed}
                    disabled={updating === task.task_id}
                    className="mt-1 h-7 w-7"
                  />
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold mb-2 ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.task_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.task_description}
                    </p>
                    {task.is_completed && task.completion_data && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full w-fit">
                        <Clock className="w-3 h-3" />
                        Completed at {new Date(task.completion_data.completion_time).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  {updating === task.task_id && (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-4 text-center text-sm text-muted-foreground">
            <p>🌱 SmartSeed Nursery Management System</p>
            <p className="text-xs mt-1">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
