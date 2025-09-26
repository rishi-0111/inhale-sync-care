import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Check, X, Mail, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CaregiverLink {
  id: string;
  caregiver_id: string;
  is_approved: boolean;
  created_at: string;
  caregiver?: {
    full_name: string;
    mobile_number?: string;
  };
}

export function PatientCaregiverLink() {
  const [isOpen, setIsOpen] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [links, setLinks] = useState<CaregiverLink[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.role === 'patient') {
      fetchCaregiverLinks();
    }
  }, [profile]);

  const fetchCaregiverLinks = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('patient_caregiver_links')
        .select(`
          id,
          caregiver_id,
          is_approved,
          created_at,
          caregiver:profiles!patient_caregiver_links_caregiver_id_fkey(
            full_name,
            mobile_number
          )
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching caregiver links:', error);
    }
  };

  const addCaregiver = async () => {
    if (!user || !profile || !caregiverEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a caregiver email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, find the caregiver by their user email (we need to find them in a different way)
      // Since we can't directly query by email in profiles, we'll use a simpler approach
      // and let the caregiver enter a code or use their profile ID for now
      toast({
        title: "Feature Coming Soon",
        description: "Caregiver linking by email will be available in the next update. Please ask your caregiver to share their profile ID for now.",
        variant: "default"
      });
      return;

      // Check if link already exists (this code will be activated when email lookup is implemented)
      const { data: existingLink } = await supabase
        .from('patient_caregiver_links')
        .select('id')
        .eq('patient_id', profile.id)
        .eq('caregiver_id', 'placeholder-id') // This will be updated when email lookup works
        .single();

      if (existingLink) {
        toast({
          title: "Already Linked", 
          description: "This caregiver is already linked to your account",
          variant: "destructive"
        });
        return;
      }

      // Create the link (disabled for now)
      /*
      const { error } = await supabase
        .from('patient_caregiver_links')
        .insert({
          patient_id: profile.id,
          caregiver_id: 'placeholder-id',
          is_approved: false
        });

      if (error) throw error;
      */

      toast({
        title: "Caregiver Invited",
        description: "Caregiver has been notified and will appear once they approve the link.",
      });

      setCaregiverEmail("");
      setIsOpen(false);
      fetchCaregiverLinks();
      
    } catch (error) {
      console.error('Error adding caregiver:', error);
      toast({
        title: "Error",
        description: "Failed to add caregiver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLinkStatus = async (linkId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('patient_caregiver_links')
        .update({ is_approved: approved })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: approved ? "Caregiver Approved" : "Caregiver Removed",
        description: approved 
          ? "Caregiver can now access your health information"
          : "Caregiver access has been revoked",
      });

      fetchCaregiverLinks();
    } catch (error) {
      console.error('Error updating caregiver link:', error);
      toast({
        title: "Error",
        description: "Failed to update caregiver status",
        variant: "destructive"
      });
    }
  };

  if (profile?.role !== 'patient') {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Caregivers
            </CardTitle>
            <CardDescription>
              Manage who can access your health information
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Caregiver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Caregiver</DialogTitle>
                <DialogDescription>
                  Enter the email address of someone who should have access to your health information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caregiver-email">Caregiver Email</Label>
                  <Input
                    id="caregiver-email"
                    type="email"
                    placeholder="caregiver@example.com"
                    value={caregiverEmail}
                    onChange={(e) => setCaregiverEmail(e.target.value)}
                  />
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
                    className="flex-1"
                    onClick={addCaregiver}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Caregiver"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No caregivers added yet</p>
            <p className="text-xs mt-1">Add a caregiver to help monitor your health</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{link.caregiver?.full_name || "Caregiver"}</p>
                    {link.caregiver?.mobile_number && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {link.caregiver.mobile_number}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={link.is_approved ? "default" : "secondary"} className={
                    link.is_approved ? "bg-accent/10 text-accent" : ""
                  }>
                    {link.is_approved ? "Active" : "Pending"}
                  </Badge>
                  {link.is_approved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLinkStatus(link.id, false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-white"
                      onClick={() => updateLinkStatus(link.id, true)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}