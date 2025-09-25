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
  ChevronRight
} from "lucide-react";

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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doses Remaining</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {primaryDevice?.remaining_doses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {primaryDevice?.total_doses || 200} total doses
              </p>
              <Progress 
                value={primaryDevice ? (primaryDevice.remaining_doses / primaryDevice.total_doses) * 100 : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentDosages.filter(d => 
                  new Date(d.taken_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                doses taken today
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery Level</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {primaryDevice?.battery_level || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                device battery level
              </p>
              <Progress 
                value={primaryDevice?.battery_level || 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reminders.length}</div>
              <p className="text-xs text-muted-foreground">
                scheduled reminders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Button */}
        <Card className="shadow-card border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Emergency SOS</h3>
                  <p className="text-sm text-red-700">
                    Alert your caregivers and medical team instantly
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleEmergencyAlert}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={recordDosage} 
                className="w-full justify-between"
                disabled={!primaryDevice}
              >
                Record Inhaler Use
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                View Usage History
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Manage Reminders
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDosages.length > 0 ? (
                <div className="space-y-3">
                  {recentDosages.slice(0, 3).map((dosage) => (
                    <div key={dosage.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          dosage.is_emergency ? 'bg-red-500' : 
                          dosage.is_scheduled ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm">
                          {dosage.is_emergency ? 'Emergency use' : 
                           dosage.is_scheduled ? 'Scheduled dose' : 'Manual dose'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dosage.taken_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity recorded
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Adherence Chart Placeholder */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Adherence chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}