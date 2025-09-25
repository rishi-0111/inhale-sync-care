import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  Battery, 
  Heart,
  MessageSquare,
  MapPin,
  Calendar,
  Plus,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";

interface LinkedPatient {
  id: string;
  full_name: string;
  is_approved: boolean;
  patient_id: string;
}

interface EmergencyAlert {
  id: string;
  patient_id: string;
  alert_type: string;
  message: string;
  location_lat?: number;
  location_lng?: number;
  is_resolved: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface PatientDevice {
  id: string;
  patient_id: string;
  device_name: string;
  remaining_doses: number;
  battery_level: number;
  profiles: {
    full_name: string;
  };
}

export default function CaregiverDashboard() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [patientDevices, setPatientDevices] = useState<PatientDevice[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaregiverData = async () => {
      if (!profile) return;

      try {
        // Fetch linked patients
        const { data: linksData } = await supabase
          .from('patient_caregiver_links')
          .select(`
            id,
            is_approved,
            patient_id,
            profiles!patient_caregiver_links_patient_id_fkey(
              id,
              full_name
            )
          `)
          .eq('caregiver_id', profile.id);

        // Fetch emergency alerts for approved patients
        const approvedPatientIds = linksData
          ?.filter(link => link.is_approved)
          .map(link => link.patient_id) || [];

        if (approvedPatientIds.length > 0) {
          const { data: alertsData } = await supabase
            .from('emergency_alerts')
            .select(`
              id,
              patient_id,
              alert_type,
              message,
              location_lat,
              location_lng,
              is_resolved,
              created_at,
              profiles!emergency_alerts_patient_id_fkey(full_name)
            `)
            .in('patient_id', approvedPatientIds)
            .eq('is_resolved', false)
            .order('created_at', { ascending: false });

          // Fetch patient devices
          const { data: devicesData } = await supabase
            .from('inhaler_devices')
            .select(`
              id,
              patient_id,
              device_name,
              remaining_doses,
              battery_level,
              profiles!inhaler_devices_patient_id_fkey(full_name)
            `)
            .in('patient_id', approvedPatientIds);

          setEmergencyAlerts(alertsData || []);
          setPatientDevices(devicesData || []);
        }

        setLinkedPatients(linksData?.map(link => ({
          id: link.id,
          full_name: (link.profiles as any)?.full_name || 'Unknown',
          is_approved: link.is_approved,
          patient_id: link.patient_id,
        })) || []);

      } catch (error) {
        console.error('Error fetching caregiver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiverData();
  }, [profile]);

  const addNote = async () => {
    if (!profile || !selectedPatient || !newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('caregiver_notes')
        .insert({
          caregiver_id: profile.id,
          patient_id: selectedPatient,
          note: newNote.trim(),
        });

      if (error) throw error;

      setNewNote("");
      setSelectedPatient("");
      toast({
        title: "Note Added",
        description: "Your note has been added successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note. Please try again.",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      setEmergencyAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Alert Resolved",
        description: "The emergency alert has been marked as resolved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
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

  const approvedPatients = linkedPatients.filter(p => p.is_approved);
  const pendingApprovals = linkedPatients.filter(p => !p.is_approved);
  const lowBatteryDevices = patientDevices.filter(d => d.battery_level < 20);
  const lowDoseDevices = patientDevices.filter(d => d.remaining_doses < 20);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Caregiver Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and support your linked patients
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Linked Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                active patient connections
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {emergencyAlerts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                unresolved emergency alerts
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Battery</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {lowBatteryDevices.length}
              </div>
              <p className="text-xs text-muted-foreground">
                devices need charging
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Doses</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {lowDoseDevices.length}
              </div>
              <p className="text-xs text-muted-foreground">
                inhalers need refilling
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alerts */}
        {emergencyAlerts.length > 0 && (
          <Card className="shadow-card border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-900">
                          {alert.profiles.full_name}
                        </h4>
                        <p className="text-sm text-red-700">{alert.message}</p>
                        <p className="text-xs text-red-600">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                        {alert.location_lat && alert.location_lng && (
                          <div className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1 text-red-600" />
                            <span className="text-xs text-red-600">Location available</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked Patients */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Linked Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedPatients.length > 0 ? (
                <div className="space-y-3">
                  {approvedPatients.map((patient) => {
                    const device = patientDevices.find(d => d.patient_id === patient.patient_id);
                    return (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{patient.full_name}</h4>
                          {device && (
                            <p className="text-sm text-muted-foreground">
                              {device.remaining_doses} doses, {device.battery_level}% battery
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No patients linked yet
                </p>
              )}
              
              {pendingApprovals.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-sm mb-2">Pending Approvals</h5>
                  {pendingApprovals.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-2 text-sm">
                      <span>{patient.full_name}</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Add Patient Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Patient</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">Choose a patient...</option>
                  {approvedPatients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea
                  placeholder="Add your observations about the patient's condition..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={addNote}
                disabled={!selectedPatient || !newNote.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Device Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Patient Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            {patientDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientDevices.map((device) => (
                  <div key={device.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{device.profiles.full_name}</h4>
                      <Badge variant={device.battery_level < 20 ? "destructive" : "secondary"}>
                        {device.battery_level}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{device.device_name}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Doses remaining:</span>
                        <span className={device.remaining_doses < 20 ? "text-red-600" : ""}>
                          {device.remaining_doses}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Battery:</span>
                        <span className={device.battery_level < 20 ? "text-red-600" : ""}>
                          {device.battery_level}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No patient devices to monitor
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}