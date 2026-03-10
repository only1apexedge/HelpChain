import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ChevronLeft, Search, UserCircle } from "lucide-react";
import { Redirect, Link } from "wouter";

interface MockConversation {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  time: string;
}

const initialConversations: MockConversation[] = [
  { id: "c1", userId: "user-sarah-1", name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah", lastMessage: "I can start the project tomorrow!", time: "2m ago", unread: 2 },
  { id: "c2", userId: "user-emeka-2", name: "Emeka Nwankwo", avatar: "https://i.pravatar.cc/150?u=emeka", lastMessage: "The move is scheduled for Saturday", time: "1h ago", unread: 0 },
  { id: "c3", userId: "user-priya-3", name: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=priya", lastMessage: "Thanks for the great review!", time: "3h ago", unread: 0 },
];

const mockMessages: Record<string, MockMessage[]> = {
  c1: [
    { id: "m1", senderId: "other", content: "Hi! I saw your task posting for web development. I'd love to help.", time: "10:30 AM" },
    { id: "m2", senderId: "me", content: "Great! Can you share some examples of your previous work?", time: "10:32 AM" },
    { id: "m3", senderId: "other", content: "Of course! Here's my portfolio. I've built 20+ React projects.", time: "10:35 AM" },
    { id: "m4", senderId: "me", content: "Impressive work. What's your timeline for this project?", time: "10:38 AM" },
    { id: "m5", senderId: "other", content: "I can start the project tomorrow!", time: "10:40 AM" },
  ],
  c2: [
    { id: "m6", senderId: "other", content: "Hello, I'm interested in helping with the office move.", time: "9:00 AM" },
    { id: "m7", senderId: "me", content: "Great! Are you available this Saturday morning?", time: "9:15 AM" },
    { id: "m8", senderId: "other", content: "The move is scheduled for Saturday", time: "9:20 AM" },
  ],
  c3: [
    { id: "m9", senderId: "other", content: "Thanks for the great review!", time: "Yesterday" },
  ],
};

export default function MessagesPage() {
  const { user } = useFirebaseAuth();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localMessages, setLocalMessages] = useState(mockMessages);
  const [conversations, setConversations] = useState(initialConversations);

  if (!user) return <Redirect to="/auth" />;

  const filteredConvs = conversations.filter(
    (c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConv = conversations.find((c) => c.id === selectedConv);
  const messages = selectedConv ? localMessages[selectedConv] || [] : [];

  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    const msg: MockMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [selectedConv]: [...(prev[selectedConv] || []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) => c.id === selectedConv ? { ...c, lastMessage: newMessage.trim(), time: "Just now" } : c)
    );
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container-tight py-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
            <div className="flex h-full">
              {/* Conversation List */}
              <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search conversations..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="pl-10 h-10 bg-muted border-0 rounded-lg" 
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConvs.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    filteredConvs.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConv(conv.id)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${selectedConv === conv.id ? "bg-muted" : ""}`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conv.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{conv.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-medium text-sm text-foreground truncate">{conv.name}</p>
                            <span className="text-xs text-muted-foreground">{conv.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium px-1.5">
                            {conv.unread}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}>
                {!selectedConv ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Select a conversation to start messaging</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedConv(null)} 
                        className="md:hidden h-9 w-9 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={currentConv?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{currentConv?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{currentConv?.name}</p>
                      </div>
                      <Link href={`/public-profile/${currentConv?.userId}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 rounded-lg">
                          <UserCircle className="w-4 h-4" /> View Profile
                        </Button>
                      </Link>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                          <div 
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              msg.senderId === "me" 
                                ? "bg-primary text-primary-foreground rounded-br-md" 
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.senderId === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                      <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type a message..." 
                        className="flex-1 h-11 bg-muted border-0 rounded-lg" 
                      />
                      <Button type="submit" size="icon" className="h-11 w-11 rounded-lg bg-primary hover:bg-primary/90" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
