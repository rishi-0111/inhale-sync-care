import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Stethoscope, User, Heart, Clipboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password must be less than 100 characters" }),
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }).max(100, { message: "Full name must be less than 100 characters" }),
  role: z.enum(['patient', 'caregiver', 'medical_team'], { message: "Please select a role" }),
  mobileNumber: z.string().trim().min(10, { message: "Mobile number must be at least 10 digits" }).max(15, { message: "Mobile number must be less than 15 digits" }).optional(),
  idProofNumber: z.string().trim().min(5, { message: "ID proof number must be at least 5 characters" }).max(50, { message: "ID proof number must be less than 50 characters" }).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const authForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      role: undefined,
      mobileNumber: "",
      idProofNumber: "",
    },
  });

  // Check if user has profile
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user && !showProfileForm) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!profile) {
          setShowProfileForm(true);
        } else {
          navigate("/");
        }
      }
    };
    
    checkUserProfile();
  }, [user, navigate, showProfileForm]);

  const onAuthSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = activeTab === "login" 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "An error occurred during authentication",
        });
      } else if (activeTab === "signup") {
        toast({
          title: "Sign Up Successful",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: data.fullName,
          role: data.role,
          mobile_number: data.mobileNumber || null,
          id_proof_number: data.idProofNumber || null,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Profile Creation Error",
          description: error.message || "Failed to create profile",
        });
      } else {
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient':
        return <User className="w-5 h-5" />;
      case 'caregiver':
        return <Heart className="w-5 h-5" />;
      case 'medical_team':
        return <Clipboard className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'patient':
        return "I am a patient who needs to track my inhaler usage and medication schedule";
      case 'caregiver':
        return "I am a caregiver who helps patients manage their respiratory health";
      case 'medical_team':
        return "I am a healthcare professional who monitors and treats patients";
      default:
        return "";
    }
  };

  if (showProfileForm && user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-medical">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about yourself to personalize your InhaleSync experience
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...profileForm.register("fullName")}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select 
                  onValueChange={(value: 'patient' | 'caregiver' | 'medical_team') => 
                    profileForm.setValue("role", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Patient</div>
                          <div className="text-xs text-muted-foreground">Track my inhaler usage</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="caregiver">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Caregiver</div>
                          <div className="text-xs text-muted-foreground">Help manage patient care</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="medical_team">
                      <div className="flex items-center gap-2">
                        <Clipboard className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Medical Team</div>
                          <div className="text-xs text-muted-foreground">Provide professional care</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {profileForm.formState.errors.role && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  {...profileForm.register("mobileNumber")}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.mobileNumber && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.mobileNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idProofNumber">ID Proof Number (Optional)</Label>
                <Input
                  id="idProofNumber"
                  type="text"
                  placeholder="Enter your ID proof number"
                  {...profileForm.register("idProofNumber")}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.idProofNumber && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.idProofNumber.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medical">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InhaleSync
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your comprehensive respiratory health companion
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...authForm.register("email")}
                    disabled={isLoading}
                  />
                  {authForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...authForm.register("password")}
                    disabled={isLoading}
                  />
                  {authForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    {...authForm.register("email")}
                    disabled={isLoading}
                  />
                  {authForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    {...authForm.register("password")}
                    disabled={isLoading}
                  />
                  {authForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}