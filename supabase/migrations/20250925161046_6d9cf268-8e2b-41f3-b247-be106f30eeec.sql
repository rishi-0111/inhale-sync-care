-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('patient', 'caregiver', 'medical_team');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  id_proof_url TEXT,
  id_proof_number TEXT,
  is_mobile_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_caregiver_links table for linking patients with caregivers
CREATE TABLE public.patient_caregiver_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, caregiver_id)
);

-- Create patient_medical_team_assignments table
CREATE TABLE public.patient_medical_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medical_team_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, medical_team_id)
);

-- Create inhaler_devices table
CREATE TABLE public.inhaler_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_id TEXT UNIQUE,
  total_doses INTEGER DEFAULT 200,
  remaining_doses INTEGER DEFAULT 200,
  battery_level INTEGER DEFAULT 100,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dosage_records table
CREATE TABLE public.dosage_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.inhaler_devices(id) ON DELETE SET NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  is_emergency BOOLEAN DEFAULT FALSE,
  environmental_trigger TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminder_schedules table
CREATE TABLE public.reminder_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_of_day TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_alerts table
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'sos', 'missed_dose', 'low_battery', etc.
  message TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create caregiver_notes table
CREATE TABLE public.caregiver_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_caregiver_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inhaler_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_notes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Medical team can view assigned patients
CREATE POLICY "Medical team can view assigned patients" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'medical_team' AND
    id IN (
      SELECT patient_id FROM public.patient_medical_assignments 
      WHERE medical_team_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Caregivers can view linked patients (if approved)
CREATE POLICY "Caregivers can view linked patients" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'caregiver' AND
    id IN (
      SELECT patient_id FROM public.patient_caregiver_links 
      WHERE caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
      AND is_approved = TRUE
    )
  );

-- Patient caregiver links policies
CREATE POLICY "Patients can manage their caregiver links" ON public.patient_caregiver_links
  FOR ALL USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Caregivers can view their links" ON public.patient_caregiver_links
  FOR SELECT USING (
    caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Inhaler devices policies
CREATE POLICY "Patients can manage their devices" ON public.inhaler_devices
  FOR ALL USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient devices" ON public.inhaler_devices
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'caregiver' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_caregiver_links 
      WHERE caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
      AND is_approved = TRUE
    )
  );

CREATE POLICY "Medical team can view assigned patient devices" ON public.inhaler_devices
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'medical_team' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_medical_assignments 
      WHERE medical_team_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Dosage records policies (similar pattern)
CREATE POLICY "Patients can manage their dosage records" ON public.dosage_records
  FOR ALL USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient dosage records" ON public.dosage_records
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'caregiver' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_caregiver_links 
      WHERE caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
      AND is_approved = TRUE
    )
  );

CREATE POLICY "Medical team can view assigned patient dosage records" ON public.dosage_records
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'medical_team' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_medical_assignments 
      WHERE medical_team_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Reminder schedules policies
CREATE POLICY "Patients can manage their reminder schedules" ON public.reminder_schedules
  FOR ALL USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Emergency alerts policies
CREATE POLICY "Patients can create emergency alerts" ON public.emergency_alerts
  FOR INSERT WITH CHECK (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can view their emergency alerts" ON public.emergency_alerts
  FOR SELECT USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Caregivers can view linked patient emergency alerts" ON public.emergency_alerts
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'caregiver' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_caregiver_links 
      WHERE caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
      AND is_approved = TRUE
    )
  );

CREATE POLICY "Medical team can view assigned patient emergency alerts" ON public.emergency_alerts
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'medical_team' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_medical_assignments 
      WHERE medical_team_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Caregiver notes policies
CREATE POLICY "Caregivers can manage their notes" ON public.caregiver_notes
  FOR ALL USING (
    caregiver_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can view notes about them" ON public.caregiver_notes
  FOR SELECT USING (
    patient_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Medical team can view caregiver notes for assigned patients" ON public.caregiver_notes
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'medical_team' AND
    patient_id IN (
      SELECT patient_id FROM public.patient_medical_assignments 
      WHERE medical_team_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for ID proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('id-proofs', 'id-proofs', false);

-- Create storage policies for ID proofs
CREATE POLICY "Users can upload their own ID proof" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'id-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ID proof" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'id-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own ID proof" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'id-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );