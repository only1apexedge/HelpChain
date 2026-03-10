import { Link, useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, X, Bell, LogOut, User, MessageCircle, Search, 
  LayoutDashboard, Wallet, Settings, HelpCircle, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const { user, logout, loading } = useFirebaseAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [location, setLocation] = useLocation();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const isLandingPage = location === '/';
  const shouldBeTransparent = (variant === 'transparent' || isLandingPage) && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedImage = localStorage.getItem("profilePicture");
    if (savedImage) setProfileImage(savedImage);
    const handleStorageChange = () => setProfileImage(localStorage.getItem("profilePicture"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const publicNavLinks = [
    { href: "/discover", label: "Find Tasks" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Tasks" },
    { href: "/messages", label: "Messages" },
    { href: "/wallet", label: "Wallet" },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const dropdownItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help Center", icon: HelpCircle },
  ];

  const mobileNavItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/discover", label: "Tasks", icon: Search },
        { href: "/wallet", label: "Wallet", icon: Wallet },
        { href: "/messages", label: "Messages", icon: MessageCircle },
        { href: "/create-request", label: "Post a Task", icon: Plus },
      ]
    : [
        { href: "/discover", label: "Find Tasks", icon: Search },
        { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
      ];

  return (
    <>
      <nav 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled || !isLandingPage
            ? "bg-background/95 backdrop-blur-md border-b border-border" 
            : "bg-transparent"
        )}
      >
        <div className="container-tight">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                  HelpChain
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      location === link.href 
                        ? "text-foreground bg-muted" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <>
                  <Link href="/create-request">
                    <Button size="sm" className="rounded-lg font-medium gap-1.5 bg-primary hover:bg-primary/90">
                      <Plus size={16} />
                      Post Task
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative rounded-lg">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-xl">
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <span className="font-medium text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={() => markAllRead()} className="text-xs text-primary hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          No notifications yet
                        </div>
                      ) : (
                        <div className="max-h-[320px] overflow-y-auto">
                          {notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => !notif.is_read && markAsRead(notif.id)}
                              className={cn(
                                "px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                                !notif.is_read && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || profileImage || undefined} alt={user.displayName || 'User'} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl" align="end">
                      <DropdownMenuLabel className="font-normal p-3">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {dropdownItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth">
                    <Button variant="ghost" className="font-medium rounded-lg">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth?mode=signup">
                    <Button className="font-medium rounded-lg bg-primary hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-background border-l border-border z-50 md:hidden overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold">Menu</span>
                    <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {user && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || profileImage || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="space-y-1">
                    {mobileNavItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                            location === item.href 
                              ? "bg-primary/10 text-primary" 
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      </Link>
                    ))}
                  </nav>

                  {user ? (
                    <div className="mt-6 pt-6 border-t border-border space-y-1">
                      <Link href="/profile">
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                        >
                          <User className="h-5 w-5" />
                          Profile
                        </button>
                      </Link>
                      <Link href="/settings">
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5" />
                        Log out
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                      <Link href="/auth">
                        <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth?mode=signup">
                        <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
