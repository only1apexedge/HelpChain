import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, ArrowRight, Shield, Clock, Star, CheckCircle2,
  Users, ChevronRight, Globe, Zap, Lock, MapPin, ArrowUpRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const typingPhrases = [
  "home cleaning",
  "graphic design",
  "delivery help",
  "web development",
  "furniture moving",
  "content writing",
];

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [, setLocation] = useLocation();
  const [typingText, setTypingText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typingText.length < currentPhrase.length) {
          setTypingText(currentPhrase.slice(0, typingText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typingText.length > 0) {
          setTypingText(typingText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
        }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, phraseIndex]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setLocation(`/discover?query=${encodeURIComponent(searchInput)}`);
    } else {
      setLocation("/discover");
    }
  };

  const stats = [
    { value: "50K+", label: "Tasks Completed" },
    { value: "120+", label: "Countries" },
    { value: "4.9", label: "Average Rating" },
    { value: "$2M+", label: "Paid to Workers" },
  ];

  const features = [
    { 
      icon: Zap, 
      title: "Post tasks in minutes", 
      desc: "Describe what you need, set your budget, and get matched with skilled workers instantly." 
    },
    { 
      icon: Lock, 
      title: "Secure escrow payments", 
      desc: "Your money is held safely until the task is completed to your satisfaction. Zero risk." 
    },
    { 
      icon: Globe, 
      title: "Local & remote services", 
      desc: "From furniture moving in Lagos to graphic design from anywhere - we cover it all." 
    },
    { 
      icon: Shield, 
      title: "Trusted & verified", 
      desc: "Every worker goes through verification. Ratings, reviews, and reputation scores you can trust." 
    },
  ];

  const categories = [
    { label: "Home Services", count: "2.4k tasks" },
    { label: "Tech Help", count: "1.8k tasks" },
    { label: "Design", count: "3.2k tasks" },
    { label: "Writing", count: "1.5k tasks" },
    { label: "Delivery", count: "890 tasks" },
    { label: "Education", count: "1.1k tasks" },
  ];

  const howItWorks = [
    { 
      step: "01", 
      title: "Post your task", 
      desc: "Describe what you need, set your budget and deadline. It takes just 2 minutes." 
    },
    { 
      step: "02", 
      title: "Get matched", 
      desc: "Receive proposals from verified workers worldwide. Compare skills, ratings, and prices." 
    },
    { 
      step: "03", 
      title: "Pay securely", 
      desc: "Funds are held in escrow until the task is completed to your satisfaction." 
    },
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "Freelance Designer",
      location: "Mexico",
      avatar: "https://i.pravatar.cc/150?img=32",
      content: "HelpChain connected me with clients globally. The escrow system means I always get paid for my work. It's completely changed my freelance career.",
    },
    {
      name: "James Okonkwo",
      role: "Business Owner",
      location: "Nigeria",
      avatar: "https://i.pravatar.cc/150?img=52",
      content: "I found reliable help for my office move within an hour. Fast, professional, and the payment protection gives me total peace of mind.",
    },
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      location: "India",
      avatar: "https://i.pravatar.cc/150?img=26",
      content: "As a part-time freelancer, HelpChain lets me pick up projects that match my skills perfectly. The global marketplace is a game changer!",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        
        <div className="container-tight relative">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Trusted by 50,000+ users worldwide
            </Badge>

            <h1 className="heading-xl text-foreground mb-6">
              Get help with anything.{" "}
              <span className="text-primary">Anytime. Anywhere.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Post tasks, hire trusted helpers, and get things done - from{" "}
              <span className="text-foreground font-medium">
                {typingText}
                <span className="animate-pulse text-primary">|</span>
              </span>
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="What do you need done?"
                  className="pl-12 h-14 text-base rounded-xl border-border bg-background shadow-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
              >
                Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap gap-2 justify-center">
              {["Cleaning", "Design", "Delivery", "Repairs", "Writing", "Tutoring"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchInput(tag);
                    setLocation(`/discover?query=${encodeURIComponent(tag)}`);
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container-tight">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-semibold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-tight">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg text-foreground mb-4">
              Everything you need to get things done
            </h2>
            <p className="text-lg text-muted-foreground">
              A powerful platform built for both clients and workers, with security and trust at its core.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 md:p-8">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <feat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feat.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-muted/30 border-y border-border">
        <div className="container-tight">
          <motion.div 
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="heading-lg text-foreground mb-2">Explore categories</h2>
              <p className="text-muted-foreground">Find or post any type of task</p>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="rounded-full">
                View all categories
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href="/discover">
                  <Card className="group cursor-pointer border-border hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-5 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{cat.label}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{cat.count}</p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding">
        <div className="container-tight">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              Getting help has never been easier. Post, match, and pay securely.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.map((item, i) => (
              <motion.div 
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full border-t-2 border-dashed border-border" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-xl font-semibold mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-request">
                <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 font-medium">
                  Post a task
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Find tasks
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-muted/30 border-y border-border">
        <div className="container-tight">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg text-foreground mb-4">What people are saying</h2>
            <p className="text-lg text-muted-foreground">
              Real stories from clients and workers across the globe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border">
                  <CardContent className="p-6 md:p-8 flex flex-col h-full">
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed flex-1 mb-6">
                      "{t.content}"
                    </p>
                    <div className="flex items-center gap-3 pt-5 border-t border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{t.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}, {t.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-tight">
          <motion.div 
            className="relative overflow-hidden rounded-3xl bg-foreground p-8 md:p-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-background mb-4">
                Start getting things done today
              </h2>
              <p className="text-lg text-background/70 mb-10 max-w-lg mx-auto">
                Join a growing community of people hiring help and earning money - from anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-request">
                  <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                    Post a task
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-background/20 text-background hover:bg-background/10">
                    Browse tasks
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
