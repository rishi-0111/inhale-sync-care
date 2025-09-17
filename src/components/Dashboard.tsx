import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Calendar,
  Pill,
  Users,
  TrendingUp,
  AlertCircle 
} from "lucide-react";

export function Dashboard() {
  const todayUsage = 3;
  const targetUsage = 4;
  const adherenceRate = 87;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InhaleSync Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your respiratory health with smart monitoring
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-medical">
            <Activity className="w-4 h-4 mr-2" />
            Sync Device
          </Button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-medical transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayUsage}/{targetUsage}</div>
              <Progress value={(todayUsage / targetUsage) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                +1 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-medical transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{adherenceRate}%</div>
              <Progress value={adherenceRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Last 7 days average
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-medical transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Environment</CardTitle>
              <div className="flex gap-1">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22°C</div>
              <div className="text-sm text-muted-foreground">65% Humidity</div>
              <Badge variant="outline" className="mt-2 text-xs">
                Optimal conditions
              </Badge>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-medical transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Dose</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2:30 PM</div>
              <p className="text-xs text-muted-foreground mt-1">
                In 45 minutes
              </p>
              <Badge className="mt-2 bg-gradient-primary border-0">
                Reminder Set
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your inhaler usage over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "10:15 AM", status: "completed", temp: "21°C", humidity: "62%" },
                  { time: "6:30 AM", status: "completed", temp: "20°C", humidity: "68%" },
                  { time: "10:45 PM", status: "missed", temp: "23°C", humidity: "58%" },
                  { time: "2:15 PM", status: "completed", temp: "22°C", humidity: "65%" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'completed' ? 'bg-accent' : 'bg-destructive'
                      }`} />
                      <div>
                        <p className="font-medium">{activity.time}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {activity.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.temp}</p>
                      <p className="text-xs text-muted-foreground">{activity.humidity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Caregiver Portal
              </Button>

              <Button variant="outline" className="w-full">
                <Pill className="w-4 h-4 mr-2" />
                Tablet Reminder
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Medication Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Inhaler</span>
                    <Badge variant="outline" className="bg-accent/10 text-accent">
                      78% remaining
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tablets</span>
                    <Badge variant="destructive" className="text-xs">
                      Low stock
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}