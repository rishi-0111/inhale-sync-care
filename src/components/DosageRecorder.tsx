import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pill, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function DosageRecorder() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState("");
  const [environmentalTrigger, setEnvironmentalTrigger] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();

  const recordDosage = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('dosage_records')
        .insert({
          patient_id: profile.id,
          taken_at: new Date().toISOString(),
          is_emergency: isEmergency,
          notes: notes || null,
          environmental_trigger: environmentalTrigger || null,
          is_scheduled: false
        });

      if (error) throw error;

      toast({
        title: "Dosage Recorded",
        description: `Inhaler use recorded successfully${isEmergency ? " (Emergency)" : ""}.`,
      });

      // Reset form
      setNotes("");
      setEnvironmentalTrigger("");
      setIsEmergency(false);
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error recording dosage:', error);
      toast({
        title: "Error",
        description: "Failed to record dosage. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-medical">
          <Plus className="w-4 h-4 mr-2" />
          Record Dosage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Record Inhaler Usage
          </DialogTitle>
          <DialogDescription>
            Log your inhaler use to track your medication adherence and patterns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="emergency"
              checked={isEmergency}
              onCheckedChange={setIsEmergency}
            />
            <div className="space-y-1">
              <Label htmlFor="emergency" className="flex items-center gap-2">
                {isEmergency && <AlertCircle className="w-4 h-4 text-destructive" />}
                Emergency Use
              </Label>
              <p className="text-xs text-muted-foreground">
                Check if this was an emergency rescue dose
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Environmental Trigger (Optional)</Label>
            <Input
              id="trigger"
              placeholder="e.g., Pollen, Dust, Exercise, Cold air"
              value={environmentalTrigger}
              onChange={(e) => setEnvironmentalTrigger(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about your symptoms or how you're feeling..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Recorded time: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-primary hover:opacity-90"
              onClick={recordDosage}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record Dosage"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}