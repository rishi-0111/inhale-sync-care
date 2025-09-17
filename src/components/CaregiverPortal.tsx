import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Bell, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Phone,
  MessageCircle 
} from "lucide-react";

export function CaregiverPortal() {
  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Caregiver Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and support your loved one's respiratory health
            </p>
          </div>
          <Button className="bg-gradient-accent hover:opacity-90 shadow-medical">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>

        {/* Patient Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-primary text-white text-lg">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">John Smith</h3>
                <p className="text-muted-foreground">Age: 45 • Asthma Patient</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-accent text-accent-foreground">
                    87% Adherence
                  </Badge>
                  <Badge variant="outline">
                    Last dose: 2 hours ago
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Important updates about medication adherence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "missed",
                    message: "Missed evening dose yesterday",
                    time: "22 hours ago",
                    severity: "high"
                  },
                  {
                    type: "environment",
                    message: "High humidity detected during morning dose",
                    time: "3 hours ago",
                    severity: "medium"
                  },
                  {
                    type: "supply",
                    message: "Inhaler running low (15% remaining)",
                    time: "1 day ago",
                    severity: "medium"
                  }
                ].map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'high' ? 'bg-destructive' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Weekly Summary
              </CardTitle>
              <CardDescription>
                Adherence and health metrics overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Adherence Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="w-[87%] h-full bg-gradient-accent rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-accent">87%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Doses Taken</span>
                  <span className="font-bold">24/28</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Environment</span>
                  <span className="font-bold">22°C, 64%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Missed Doses</span>
                  <Badge variant="destructive" className="text-xs">
                    4 doses
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Timeline */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Usage Timeline - Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const doses = [4, 4, 3, 4, 4, 2, 3][index];
                const target = 4;
                return (
                  <div key={day} className="text-center">
                    <p className="text-sm font-medium mb-2">{day}</p>
                    <div className="flex flex-col gap-1">
                      {Array.from({ length: target }, (_, i) => (
                        <div
                          key={i}
                          className={`h-3 rounded-sm ${
                            i < doses 
                              ? 'bg-gradient-accent' 
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doses}/{target}
                    </p>
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