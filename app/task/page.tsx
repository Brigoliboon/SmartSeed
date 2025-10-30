"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, MapPin, Layers, User, Sprout, ArrowLeft, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Task {
  task_id: number;
  task_name: string;
  task_description: string;
}

interface Bed {
  bed_name: string;
  location_name: string;
  species_category: string;
  person_in_charge_name: string;
  qr_code: string;
}

export default function TaskChecklistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrCode = searchParams.get('qr');

  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [bed, setBed] = useState<Bed | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user name is stored
    const storedName = localStorage.getItem('field_worker_name');
    if (storedName) {
      setUserName(storedName);
      setShowNameInput(false);
    }

    // Fetch bed data if QR code is provided
    if (qrCode) {
      fetchBedData();
    } else {
      // Use sample data if no QR code
      setBed({
        bed_name: 'Plant Bed A1',
        location_name: 'Greenhouse Section A',
        species_category: 'Forestry',
        person_in_charge_name: 'Juan Dela Cruz',
        qr_code: 'BED-A1-QR2024'
      });
      setTasks([
        { task_id: 1, task_name: 'Check Soil Moisture', task_description: 'Verify soil moisture levels are within optimal range (55-70%)' },
        { task_id: 2, task_name: 'Inspect for Pests', task_description: 'Check leaves and stems for signs of pest infestation' },
        { task_id: 3, task_name: 'Water Plants', task_description: 'Water plants if soil moisture is below 55%' },
        { task_id: 4, task_name: 'Check Temperature', task_description: 'Ensure temperature is between 20-28°C' },
        { task_id: 5, task_name: 'Record Observations', task_description: 'Note any unusual growth patterns or issues' }
      ]);
    }
  }, [qrCode]);

  const fetchBedData = async () => {
    try {
      setLoading(true);
      const bedResponse = await fetch(`/api/beds?qrCode=${qrCode}`);
      const bedData = await bedResponse.json();
      
      if (bedData.success && bedData.beds.length > 0) {
        setBed(bedData.beds[0]);
        
        // Using sample tasks for now
        setTasks([
          { task_id: 1, task_name: 'Check Soil Moisture', task_description: 'Verify soil moisture levels are within optimal range (55-70%)' },
          { task_id: 2, task_name: 'Inspect for Pests', task_description: 'Check leaves and stems for signs of pest infestation' },
          { task_id: 3, task_name: 'Water Plants', task_description: 'Water plants if soil moisture is below 55%' },
          { task_id: 4, task_name: 'Check Temperature', task_description: 'Ensure temperature is between 20-28°C' },
          { task_id: 5, task_name: 'Record Observations', task_description: 'Note any unusual growth patterns or issues' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching bed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (userName.trim()) {
      localStorage.setItem('field_worker_name', userName);
      setShowNameInput(false);
    }
  };

  const handleCheckboxChange = (taskId: number) => {
    setCheckedItems(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSubmit = () => {
    // Just navigate back to main page
    router.push('/');
  };

  const allTasksCompleted = checkedItems.length === tasks.length;
  const completedCount = checkedItems.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!bed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold">Bed Not Found</h2>
            <p className="text-muted-foreground">The QR code is not valid.</p>
            <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

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
        {!showNameInput && (
          <>
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
                  setUserName('');
                  localStorage.removeItem('field_worker_name');
                  setShowNameInput(true);
                }}
                className="text-blue-600"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Checklist */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = checkedItems.includes(task.task_id);
            return (
              <Card
                key={task.task_id}
                className={`cursor-pointer transition-all ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-lg border-2'
                }`}
                onClick={() => handleCheckboxChange(task.task_id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isCompleted}
                      className="mt-1 h-7 w-7"
                    />
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.task_description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6 pb-6">
            <Button 
              onClick={handleSubmit}
              className="w-full h-14 text-lg"
              variant="secondary"
              disabled={!allTasksCompleted}
            >
              {allTasksCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit Checklist
                </>
              ) : (
                `Complete ${tasks.length - completedCount} more task${tasks.length - completedCount !== 1 ? 's' : ''} to submit`
              )}
            </Button>
            {!allTasksCompleted && (
              <p className="text-center text-sm mt-3 text-primary-foreground/80">
                Please complete all tasks before submitting
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-4 text-center text-sm text-muted-foreground">
            <p>🌱 SmartSeed Nursery Management System</p>
            <p className="text-xs mt-1">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
