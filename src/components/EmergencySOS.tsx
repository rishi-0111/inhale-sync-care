import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Phone, MapPin, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function EmergencySOS() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Emergency will be sent without location data.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const sendEmergencyAlert = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .insert({
          patient_id: profile.id,
          alert_type: 'SOS',
          message: emergencyMessage || 'Emergency SOS activated',
          location_lat: location?.lat,
          location_lng: location?.lng,
          is_resolved: false
        });

      if (error) throw error;

      setIsEmergencyActive(true);
      toast({
        title: "Emergency Alert Sent",
        description: "Your caregivers and medical team have been notified.",
        variant: "default"
      });

      // Reset form
      setEmergencyMessage("");
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please call emergency services.",
        variant: "destructive"
      });
    }
  };

  const cancelEmergency = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ is_resolved: true })
        .eq('patient_id', profile.id)
        .eq('is_resolved', false);

      if (error) throw error;

      setIsEmergencyActive(false);
      toast({
        title: "Emergency Cancelled",
        description: "Emergency alert has been cancelled.",
      });
      
    } catch (error) {
      console.error('Error cancelling emergency:', error);
      toast({
        title: "Error",
        description: "Failed to cancel emergency alert.",
        variant: "destructive"
      });
    }
  };

  if (isEmergencyActive) {
    return (
      <Card className="border-destructive shadow-lg animate-pulse">
        <CardHeader className="bg-destructive/10">
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Active
          </CardTitle>
          <CardDescription>
            Your emergency alert has been sent to your caregivers and medical team.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">Emergency services notified</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEmergency}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel Emergency
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-destructive hover:bg-destructive/90">
                <Phone className="w-4 h-4 mr-2" />
                Call 911
              </Button>
              <Button variant="outline" className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Share Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="w-full h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg text-lg font-bold"
          onClick={getCurrentLocation}
        >
          <AlertTriangle className="w-6 h-6 mr-3" />
          EMERGENCY SOS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Alert
          </DialogTitle>
          <DialogDescription>
            This will immediately notify your caregivers and medical team. Only use in case of a real emergency.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Optional: Describe your emergency (e.g., 'Severe breathing difficulty', 'Inhaler not working')"
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {location ? "Location detected" : "Getting location..."}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEmergencyMessage("")}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90"
              onClick={sendEmergencyAlert}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Emergency Alert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}