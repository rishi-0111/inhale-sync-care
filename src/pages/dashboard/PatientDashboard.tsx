import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Wind, 
  AlertTriangle, 
  Battery, 
  Calendar, 
  Settings,
  Phone,
  MapPin,
  ChevronRight,
  Pill,
  Users,
  Plus,
  Thermometer,
  Droplets,
  TrendingUp
} from "lucide-react";
import { EmergencySOS } from "@/components/EmergencySOS";
import { DosageRecorder } from "@/components/DosageRecorder";
import { PatientCaregiverLink } from "@/components/PatientCaregiverLink";

interface InhalerDevice {
  id: string;
  device_name: string;
  remaining_doses: number;
  total_doses: number;
  battery_level: number;
  last_sync: string;
}

interface DosageRecord {
  id: string;
  taken_at: string;
  is_scheduled: boolean;
  is_emergency: boolean;
  environmental_trigger?: string;
}

interface ReminderSchedule {
  id: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
}

export default function PatientDashboard() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [devices, setDevices] = useState<InhalerDevice[]>([]);
  const [recentDosages, setRecentDosages] = useState<DosageRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!profile) return;

      try {
        // Fetch inhaler devices
        const { data: devicesData } = await supabase
          .from('inhaler_devices')
          .select('*')
          .eq('patient_id', profile.id);

        // Fetch recent dosage records
        const { data: dosagesData } = await supabase
          .from('dosage_records')
          .select('*')
          .eq('patient_id', profile.id)
          .order('taken_at', { ascending: false })
          .limit(5);

        // Fetch reminder schedules
        const { data: remindersData } = await supabase
          .from('reminder_schedules')
          .select('*')
          .eq('patient_id', profile.id)
          .eq('is_active', true);

        setDevices(devicesData || []);
        setRecentDosages(dosagesData || []);
        setReminders(remindersData || []);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [profile]);

  const handleEmergencyAlert = async () => {
    if (!profile) return;

    try {
      // Get user's location if available
      let location = { lat: null, lng: null };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          location.lat = position.coords.latitude;
          location.lng = position.coords.longitude;
        });
      }

      const { error } = await supabase
        .from('emergency_alerts')
        .insert({
          patient_id: profile.id,
          alert_type: 'sos',
          message: 'Emergency SOS activated by patient',
          location_lat: location.lat,
          location_lng: location.lng,
        });

      if (error) throw error;

      toast({
        title: "Emergency Alert Sent",
        description: "Your caregivers and medical team have been notified.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
      });
    }
  };

  const recordDosage = async () => {
    if (!profile || devices.length === 0) return;

    try {
      const { error } = await supabase
        .from('dosage_records')
        .insert({
          patient_id: profile.id,
          device_id: devices[0].id,
          is_scheduled: false,
          is_emergency: false,
        });

      if (error) throw error;

      toast({
        title: "Dosage Recorded",
        description: "Your inhaler usage has been logged successfully.",
      });

      // Refresh data
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record dosage. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryDevice = devices[0];
  const dosagePercentage = primaryDevice ? 
    ((primaryDevice.total_doses - primaryDevice.remaining_doses) / primaryDevice.total_doses) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Track your respiratory health and manage your inhaler usage
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
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
              <div className="text-2xl font-bold">
                {recentDosages.filter(d => 
                  new Date(d.taken_at).toDateString() === new Date().toDateString()
                ).length}/4
              </div>
              <Progress value={(recentDosages.filter(d => 
                new Date(d.taken_at).toDateString() === new Date().toDateString()
              ).length / 4) * 100} className="mt-2" />
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
              <div className="text-2xl font-bold text-accent">87%</div>
              <Progress value={87} className="mt-2" />
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
              <AlertTriangle className="h-4 w-4 text-destructive" />
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
          {/* Emergency & Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmergencySOS />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DosageRecorder />
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDosages.length > 0 ? (
                <div className="space-y-4">
                  {recentDosages.slice(0, 4).map((dosage) => (
                    <div key={dosage.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          dosage.is_emergency ? 'bg-destructive' : 'bg-accent'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {dosage.is_emergency ? 'Emergency use' : 'Inhaler use'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(dosage.taken_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medication Status & Caregiver Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Albuterol Inhaler</p>
                  <p className="text-sm text-muted-foreground">2 puffs as needed</p>
                </div>
                <Badge className="bg-accent/10 text-accent">
                  {primaryDevice ? `${Math.round((primaryDevice.remaining_doses / primaryDevice.total_doses) * 100)}% remaining` : '0% remaining'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Budesonide</p>
                  <p className="text-sm text-muted-foreground">2 puffs twice daily</p>
                </div>
                <Badge variant="destructive">
                  Low stock
                </Badge>
              </div>
            </CardContent>
          </Card>

          <PatientCaregiverLink />
        </div>
      </div>
    </div>
  );
}