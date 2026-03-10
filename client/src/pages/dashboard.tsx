import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useWallet } from "@/hooks/use-wallet";
import {
  Plus, Search, ClipboardList, Wallet, TrendingUp,
  Star, Clock, CheckCircle, ArrowRight, Activity, Eye, EyeOff, ArrowUpRight
} from "lucide-react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { useTasksStore } from "@/stores/tasks-store";
import { useProfileStore } from "@/stores/profile-store";
import { useLocalizationStore } from "@/stores/localization-store";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useFirebaseAuth();
  const { availableBalance, escrowBalance, isLoading: walletLoading } = useWallet();
  const { formatLocal } = useLocalizationStore();
  const tasks = useTasksStore((s) => s.tasks);
  const currentProfile = useProfileStore((s) => s.getCurrentProfile());
  const [hideBalance, setHideBalance] = useState(false);

  if (!user) return <Redirect to="/auth" />;

  const displayName = user.displayName || currentProfile?.fullName || "User";
  const myTasks = tasks.filter((t) => t.creatorId === user.uid);
  const myApplications = tasks.filter((t) => t.applications.some((a) => a.workerId === user.uid));
  const activeTasks = myTasks.filter((t) => ["published", "in_progress", "accepted"].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === "completed");
  const pendingApps = myApplications.filter((t) => t.applications.some((a) => a.workerId === user.uid && a.status === "sent"));

  const stats = [
    { label: "Active Tasks", value: activeTasks.length, icon: Activity, change: "+2 this week" },
    { label: "Tasks Posted", value: myTasks.length, icon: ClipboardList },
    { label: "Completed", value: completedTasks.length, icon: CheckCircle },
    { label: "Pending Offers", value: pendingApps.length, icon: Clock },
  ];

  const recentTasks = [...myTasks, ...myApplications]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const masked = "******";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary/10 text-primary";
      case "in_progress": return "bg-blue-500/10 text-blue-600";
      case "published": return "bg-amber-500/10 text-amber-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container-tight py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Welcome back, {displayName.split(' ')[0]}</h1>
              <p className="text-muted-foreground text-sm mt-1">Here's an overview of your activity</p>
            </div>
            <Link href="/create-request">
              <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-lg">
                <Plus size={16} />
                Post Task
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-foreground text-background border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-background/60 text-sm">Available Balance</p>
                          <button 
                            onClick={() => setHideBalance(!hideBalance)} 
                            className="text-background/40 hover:text-background/60 transition-colors"
                          >
                            {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <p className="text-3xl font-semibold">{hideBalance ? masked : formatLocal(availableBalance)}</p>
                        {escrowBalance > 0 && (
                          <p className="text-background/50 text-sm mt-1">
                            {hideBalance ? masked : formatLocal(escrowBalance)} in escrow
                          </p>
                        )}
                      </div>
                      <Link href="/wallet">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="bg-background/10 hover:bg-background/20 text-background border-0 gap-2"
                        >
                          <Wallet size={16} />
                          Wallet
                          <ArrowUpRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Tasks */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Recent Tasks</CardTitle>
                    <Link href="/discover">
                      <Button variant="ghost" size="sm" className="text-primary gap-1 h-8">
                        View all
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">No tasks yet</p>
                      <Link href="/create-request">
                        <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4" />
                          Post your first task
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {recentTasks.map((task) => (
                        <Link key={task.id} href={`/request/${task.id}`}>
                          <div className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-4 px-4 transition-colors cursor-pointer first:pt-0 last:pb-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.applications.length} offer{task.applications.length !== 1 ? "s" : ""} · {task.category}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(task.status)} capitalize text-xs ml-3 font-normal`}>
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{currentProfile?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rep Score</span>
                    <span className="text-sm font-medium">{currentProfile?.reputationScore || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">{currentProfile?.successRate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Done</span>
                    <span className="text-sm font-medium">{currentProfile?.helpsGiven || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[
                    { label: "Post a Task", href: "/create-request", icon: Plus },
                    { label: "Find Tasks", href: "/discover", icon: Search },
                    { label: "My Wallet", href: "/wallet", icon: Wallet },
                  ].map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className="flex items-center gap-3 p-3 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <action.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
