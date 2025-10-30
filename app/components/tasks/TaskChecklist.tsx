"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, Loader2, CheckCircle, MapPin, User, Layers } from 'lucide-react';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

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

interface TaskChecklistProps {
  bedId: string;
  user: User;
  onBack: () => void;
}

export function TaskChecklist({ bedId, user, onBack }: TaskChecklistProps) {
  const [bed, setBed] = useState<Bed | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [bedId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/bed/${bedId}`);
      const data = await response.json();

      if (data.success) {
        setBed(data.bed);
        setTasks(data.tasks);
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      setError('Error loading tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (task: Task) => {
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
        // Mark as completed
        const response = await fetch('/api/tasks/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_id: bed?.bed_id,
            task_id: task.task_id,
            completed_by: user.user_id,
            notes: null
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Daily Task Checklist</h1>
        </div>
      </div>

      {/* Bed Information */}
      {bed && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{bed.bed_name}</CardTitle>
              <Badge className="capitalize">
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
              <span className="text-sm">QR Code: {bed.qr_code}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Card */}
      <Card className={allTasksCompleted ? 'border-green-500 bg-green-50' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-2xl font-bold">
                {completedCount} / {tasks.length} Tasks
              </p>
            </div>
            {allTasksCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="font-semibold">All Done!</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all bg-green-600"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Task Checklist */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card
            key={task.task_id}
            className={`cursor-pointer transition-all ${
              task.is_completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
            }`}
            onClick={() => updating === null && handleTaskToggle(task)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.is_completed}
                  disabled={updating === task.task_id}
                  className="mt-1 h-6 w-6"
                />
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.task_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {task.task_description}
                  </p>
                  {task.is_completed && task.completion_data && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Completed at {new Date(task.completion_data.completion_time).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                {updating === task.task_id && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Message */}
      {allTasksCompleted && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Excellent Work!
              </h2>
              <p className="text-green-700">
                All tasks for {bed?.bed_name} have been completed today.
              </p>
              <Button
                onClick={onBack}
                className="mt-6"
                size="lg"
              >
                Scan Another Bed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
