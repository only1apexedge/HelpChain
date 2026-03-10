import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initialMode = new URLSearchParams(search).get("mode") || "login";
  
  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading } = useFirebaseAuth();
  const { sendWelcomeNotification } = useNotifications();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup" | "reset">(
    initialMode === "signup" ? "signup" : initialMode === "reset" ? "reset" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user) {
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      setLocation(onboardingDone ? "/profile" : "/onboarding");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        setLocation("/profile");
      } else if (mode === "signup") {
        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          toast({
            title: "Weak password",
            description: "Password must be at least 6 characters.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, displayName);
        setTimeout(() => sendWelcomeNotification(displayName), 2000);
        toast({
          title: "Account created!",
          description: "Welcome to HelpChain! Let's set up your profile.",
        });
        setLocation("/onboarding");
      } else if (mode === "reset") {
        await resetPassword(email);
        toast({
          title: "Reset email sent",
          description: "Please check your email for password reset instructions.",
        });
        setMode("login");
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (message.includes("auth/invalid-credential")) {
        message = "Invalid email or password";
      } else if (message.includes("auth/email-already-in-use")) {
        message = "An account with this email already exists";
      } else if (message.includes("auth/weak-password")) {
        message = "Password is too weak. Use at least 6 characters";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const onboardingDone = localStorage.getItem("hc-onboarding-done");
      setTimeout(() => sendWelcomeNotification(user?.displayName || undefined), 2000);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      setLocation(onboardingDone ? "/profile" : "/onboarding");
    } catch (error: any) {
      if (error?.message?.includes("cancelled") || error?.code === "auth/popup-closed-by-user") return;
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2.5 mb-10 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HC</span>
              </div>
              <span className="text-lg font-semibold text-foreground">HelpChain</span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "reset" && "Reset your password"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {mode === "login" && "Sign in to continue to HelpChain"}
              {mode === "signup" && "Get started by creating a new account"}
              {mode === "reset" && "Enter your email to receive reset instructions"}
            </p>

            {mode !== "reset" && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full h-11 gap-3 font-medium mb-6"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="displayName"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label htmlFor="displayName" className="text-sm font-medium">Full name</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="John Doe"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              
              {mode !== "reset" && (
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-11 font-medium bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" && "Sign in"}
                    {mode === "signup" && "Create account"}
                    {mode === "reset" && "Send reset email"}
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              {mode === "login" && (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-muted/30 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">HC</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Get help with anything. Anytime. Anywhere.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Join thousands of people posting tasks and earning money on HelpChain. 
            Whether you need help or want to help others, we've got you covered.
          </p>
          <div className="mt-10 flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Secure payments
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Verified workers
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
