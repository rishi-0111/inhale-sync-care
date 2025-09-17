import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pill, 
  Clock, 
  Package, 
  AlertCircle,
  CheckCircle2,
  Plus 
} from "lucide-react";

export function MedicationTracker() {
  const medications = [
    {
      name: "Albuterol Inhaler",
      type: "Rescue Inhaler",
      dosage: "2 puffs",
      frequency: "As needed",
      remaining: 78,
      refillDate: "2024-02-15",
      status: "active"
    },
    {
      name: "Budesonide",
      type: "Controller",
      dosage: "2 puffs",
      frequency: "Twice daily",
      remaining: 45,
      refillDate: "2024-01-28",
      status: "low"
    },
    {
      name: "Montelukast",
      type: "Tablet",
      dosage: "10mg",
      frequency: "Once daily (evening)",
      remaining: 12,
      refillDate: "2024-01-20",
      status: "critical"
    }
  ];

  const todaySchedule = [
    { time: "8:00 AM", medication: "Budesonide", completed: true },
    { time: "12:00 PM", medication: "Albuterol (PRN)", completed: true },
    { time: "6:00 PM", medication: "Budesonide", completed: false },
    { time: "9:00 PM", medication: "Montelukast", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Medication Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your inhaler and tablet schedules
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-medical">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Track your daily medication routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <Checkbox 
                    checked={item.completed} 
                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.time}</span>
                      <Badge variant={item.completed ? "outline" : "default"} className={
                        item.completed ? "bg-accent/10 text-accent" : ""
                      }>
                        {item.medication}
                      </Badge>
                    </div>
                  </div>
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Medication Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {medications.map((med, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    <div>
                      <CardTitle className="text-lg">{med.name}</CardTitle>
                      <CardDescription>{med.type}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      med.status === 'critical' ? 'destructive' : 
                      med.status === 'low' ? 'default' : 'outline'
                    }
                    className={
                      med.status === 'active' ? 'bg-accent/10 text-accent' : ''
                    }
                  >
                    {med.status === 'critical' ? 'Critical' : 
                     med.status === 'low' ? 'Low Stock' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dosage & Frequency</p>
                  <p className="font-medium">{med.dosage} • {med.frequency}</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Remaining</span>
                    <span className="font-medium">{med.remaining}%</span>
                  </div>
                  <Progress value={med.remaining} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4" />
                  <span>Refill by: {med.refillDate}</span>
                  {med.status === 'critical' && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={med.status === 'active'}
                >
                  {med.status === 'critical' ? 'Order Refill' : 
                   med.status === 'low' ? 'Schedule Refill' : 'Well Stocked'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Adherence */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Weekly Adherence Overview
            </CardTitle>
            <CardDescription>
              Your medication compliance over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const adherence = [100, 100, 75, 100, 100, 50, 100][index];
                return (
                  <div key={day} className="text-center">
                    <p className="text-sm font-medium mb-2">{day}</p>
                    <div className="relative w-16 h-16 mx-auto">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="m18,2.0845a 15.9155,15.9155 0 0,1 0,31.831a 15.9155,15.9155 0 0,1 0,-31.831"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="3"
                        />
                        <path
                          d="m18,2.0845a 15.9155,15.9155 0 0,1 0,31.831a 15.9155,15.9155 0 0,1 0,-31.831"
                          fill="none"
                          stroke={adherence === 100 ? "hsl(var(--accent))" : adherence >= 75 ? "#f59e0b" : "hsl(var(--destructive))"}
                          strokeWidth="3"
                          strokeDasharray={`${adherence}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{adherence}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}