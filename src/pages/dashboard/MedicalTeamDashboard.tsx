import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Activity, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Stethoscope,
  Eye,
  Edit,
  BarChart3
} from "lucide-react";

interface AssignedPatient {
  id: string;
  patient_id: string;
  profiles: {
    id: string;
    full_name: string;
    mobile_number?: string;
  };
}

interface PatientStats {
  patient_id: string;
  patient_name: string;
  total_doses: number;
  doses_this_week: number;
  missed_doses: number;
  last_dose: string;
  adherence_rate: number;
}

interface EmergencyAlert {
  id: string;
  patient_id: string;
  alert_type: string;
  message: string;
  created_at: string;
  is_resolved: boolean;
  profiles: {
    full_name: string;
  };
}

interface CaregiverNote {
  id: string;
  note: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function MedicalTeamDashboard() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [assignedPatients, setAssignedPatients] = useState<AssignedPatient[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [caregiverNotes, setCaregiverNotes] = useState<CaregiverNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchMedicalTeamData = async () => {
      if (!profile) return;

      try {
        // Fetch assigned patients
        const { data: assignmentsData } = await supabase
          .from('patient_medical_assignments')
          .select(`
            id,
            patient_id,
            profiles!patient_medical_assignments_patient_id_fkey(
              id,
              full_name,
              mobile_number
            )
          `)
          .eq('medical_team_id', profile.id);

        const patientIds = assignmentsData?.map(a => a.patient_id) || [];

        if (patientIds.length > 0) {
          // Fetch emergency alerts
          const { data: alertsData } = await supabase
            .from('emergency_alerts')
            .select(`
              id,
              patient_id,
              alert_type,
              message,
              created_at,
              is_resolved,
              profiles!emergency_alerts_patient_id_fkey(full_name)
            `)
            .in('patient_id', patientIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Fetch caregiver notes
          const { data: notesData } = await supabase
            .from('caregiver_notes')
            .select(`
              id,
              note,
              created_at,
              profiles!caregiver_notes_caregiver_id_fkey(full_name)
            `)
            .in('patient_id', patientIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Calculate patient statistics
          const stats: PatientStats[] = [];
          for (const assignment of assignmentsData || []) {
            const { data: dosageData } = await supabase
              .from('dosage_records')
              .select('*')
              .eq('patient_id', assignment.patient_id);

            const totalDoses = dosageData?.length || 0;
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const dosesThisWeek = dosageData?.filter(d => 
              new Date(d.taken_at) >= weekAgo
            ).length || 0;

            const lastDose = dosageData?.[0]?.taken_at || '';
            
            // Simple adherence calculation (this would be more complex in real implementation)
            const adherenceRate = totalDoses > 0 ? Math.min(100, (dosesThisWeek / 14) * 100) : 0;

            stats.push({
              patient_id: assignment.patient_id,
              patient_name: (assignment.profiles as any)?.full_name || 'Unknown',
              total_doses: totalDoses,
              doses_this_week: dosesThisWeek,
              missed_doses: Math.max(0, 14 - dosesThisWeek), // Assuming 2 doses per day
              last_dose: lastDose,
              adherence_rate: Math.round(adherenceRate),
            });
          }

          setEmergencyAlerts(alertsData || []);
          setCaregiverNotes(notesData || []);
          setPatientStats(stats);
        }

        setAssignedPatients(assignmentsData || []);
      } catch (error) {
        console.error('Error fetching medical team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalTeamData();
  }, [profile]);

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      setEmergencyAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, is_resolved: true } : alert
        )
      );

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

  const activeAlerts = emergencyAlerts.filter(a => !a.is_resolved);
  const avgAdherence = patientStats.length > 0 
    ? Math.round(patientStats.reduce((sum, p) => sum + p.adherence_rate, 0) / patientStats.length)
    : 0;
  const criticalPatients = patientStats.filter(p => p.adherence_rate < 50).length;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Medical Team Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor patient health and manage treatment plans
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center">
              <Stethoscope className="w-3 h-3 mr-1" />
              {profile?.full_name}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                under your care
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
                {activeAlerts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                requiring attention
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Adherence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {avgAdherence}%
              </div>
              <p className="text-xs text-muted-foreground">
                across all patients
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {criticalPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                low adherence patients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alerts */}
        {activeAlerts.length > 0 && (
          <Card className="shadow-card border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.slice(0, 3).map((alert) => (
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
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Patient Overview</TabsTrigger>
            <TabsTrigger value="reports">Adherence Reports</TabsTrigger>
            <TabsTrigger value="notes">Caregiver Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Patient Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientStats.length > 0 ? (
                  <div className="space-y-4">
                    {patientStats.map((patient) => (
                      <div key={patient.patient_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{patient.patient_name}</h4>
                            <Badge 
                              variant={
                                patient.adherence_rate >= 80 ? "default" :
                                patient.adherence_rate >= 50 ? "secondary" : "destructive"
                              }
                            >
                              {patient.adherence_rate}% adherence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="block font-medium text-foreground">
                                {patient.doses_this_week}
                              </span>
                              <span>Doses this week</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">
                                {patient.total_doses}
                              </span>
                              <span>Total doses</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">
                                {patient.last_dose ? new Date(patient.last_dose).toLocaleDateString() : 'N/A'}
                              </span>
                              <span>Last dose</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No patients assigned yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Adherence Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Adherence charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Caregiver Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caregiverNotes.length > 0 ? (
                  <div className="space-y-4">
                    {caregiverNotes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{note.profiles.full_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No caregiver notes available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}