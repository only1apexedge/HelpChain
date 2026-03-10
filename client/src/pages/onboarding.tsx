import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useProfileApi } from "@/hooks/use-profile-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Loader2, ChevronRight, ChevronLeft, 
  User, Briefcase, Check, Navigation, 
  Zap, Shield, Globe, DollarSign
} from "lucide-react";

const SKILL_OPTIONS = [
  "Web Development", "Mobile Apps", "Design", "Writing", "Marketing",
  "Data Entry", "Translation", "Video Editing", "Photography", "Tutoring",
  "Cleaning", "Moving", "Delivery", "Handyman", "Cooking",
  "Pet Care", "Gardening", "Errands", "Research", "Consulting",
];

const WELCOME_SLIDES = [
  {
    icon: Zap,
    title: "Post tasks in minutes",
    description: "Describe what you need, set your budget, and get matched with skilled workers instantly."
  },
  {
    icon: Shield,
    title: "Secure escrow payments",
    description: "Your money is held safely until the task is completed to your satisfaction. Zero risk."
  },
  {
    icon: Globe,
    title: "Local & remote services",
    description: "From furniture moving to graphic design - find help for anything, anywhere."
  },
  {
    icon: DollarSign,
    title: "Earn by helping others",
    description: "Browse available tasks, submit proposals, and get paid for your skills."
  },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, updateUserProfile } = useFirebaseAuth();
  const { updateProfile } = useProfileApi();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [fullName, setFullName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [location, setLocationVal] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const totalSteps = 4; // Welcome slides + Profile + Skills

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";
          setLocationVal(city ? `${city}, ${country}` : country || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        } catch {
          setLocationVal(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setGettingLocation(false);
      },
      (err) => {
        toast({ title: "Location access denied", description: err.message, variant: "destructive" });
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName || user?.displayName || "User",
        bio,
        location: location,
        skills: selectedSkills,
        email: user?.email || undefined,
      });
      if (fullName && fullName !== user?.displayName) {
        await updateUserProfile({ displayName: fullName });
      }
      localStorage.setItem("hc-onboarding-done", "true");
      toast({ title: "Profile set up!", description: "You're all set to start using HelpChain." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step < WELCOME_SLIDES.length) return true;
    if (step === WELCOME_SLIDES.length) return fullName.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Welcome Slides */}
            {step < WELCOME_SLIDES.length && (
              <motion.div 
                key={`welcome-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 text-center">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const Icon = WELCOME_SLIDES[step].icon;
                        return <Icon className="w-10 h-10 text-primary" />;
                      })()}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                      {WELCOME_SLIDES[step].title}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md mx-auto">
                      {WELCOME_SLIDES[step].description}
                    </p>
                    
                    {/* Slide Indicators */}
                    <div className="flex justify-center gap-2 mb-10">
                      {WELCOME_SLIDES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setStep(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === step ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {step > 0 && (
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className="flex-1 h-12 rounded-xl"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Back
                        </Button>
                      )}
                      <Button 
                        onClick={handleNext}
                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        {step === WELCOME_SLIDES.length - 1 ? "Get Started" : "Continue"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    
                    {step === 0 && (
                      <button
                        onClick={() => setStep(WELCOME_SLIDES.length)}
                        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Skip intro
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Profile Step */}
            {step === WELCOME_SLIDES.length && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Tell us about yourself</h2>
                    <p className="text-sm text-muted-foreground mb-6">This helps others find and trust you</p>

                    <div className="space-y-5">
                      <div>
                        <Label className="text-sm font-medium">Full name</Label>
                        <Input 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          placeholder="Your name" 
                          className="mt-1.5 h-11" 
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Short bio</Label>
                        <Textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)} 
                          placeholder="What do you do? What are you good at?" 
                          className="mt-1.5 min-h-[100px] resize-none" 
                          maxLength={300} 
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/300</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <div className="flex gap-2 mt-1.5">
                          <Input 
                            value={location} 
                            onChange={(e) => setLocationVal(e.target.value)} 
                            placeholder="e.g., Lagos, Nigeria" 
                            className="flex-1 h-11" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="h-11 gap-2 px-4" 
                            onClick={getCurrentLocation} 
                            disabled={gettingLocation}
                          >
                            {gettingLocation ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Navigation className="w-4 h-4" />
                                Detect
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        className="flex-1 h-11 rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90" 
                        disabled={!canProceed()}
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skills Step */}
            {step === WELCOME_SLIDES.length + 1 && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">What are your skills?</h2>
                    <p className="text-sm text-muted-foreground mb-6">Select skills you can help others with (optional)</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {SKILL_OPTIONS.map((skill) => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                            selectedSkills.includes(skill) 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {selectedSkills.includes(skill) && <Check className="w-3 h-3 mr-1" />}
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedSkills.length > 0 && (
                      <p className="text-sm text-muted-foreground mb-6">
                        {selectedSkills.length} skill{selectedSkills.length > 1 ? "s" : ""} selected
                      </p>
                    )}

                    <div className="flex gap-3 mt-8">
                      <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        className="flex-1 h-11 rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleComplete} 
                        disabled={saving} 
                        className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Complete setup"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
