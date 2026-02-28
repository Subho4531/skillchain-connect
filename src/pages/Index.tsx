import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, Trophy, BookOpen, Award, ArrowRight, Zap } from "lucide-react";

export default function Dashboard() {
  const { isConnected, isAdmin, connect } = useWallet();

  const stats = [
    { label: "Active Campaigns", value: "12", icon: Trophy, color: "text-primary" },
    { label: "Students Enrolled", value: "248", icon: BookOpen, color: "text-accent" },
    { label: "Certificates Minted", value: "89", icon: Award, color: "text-success" },
    { label: "Total Bounties", value: "15,000", icon: Zap, color: "text-warning", suffix: " CAMPUS" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(174_72%_50%/0.08),transparent_60%)]" />
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              Powered by Algorand
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
              <span className="text-gradient-accent">SkillQuest</span>{" "}
              <span className="text-foreground">Campus</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              AI-powered tokenized skill campaigns. Learn, build, earn bounties, 
              and mint NFT certificates — all on-chain.
            </p>

            {!isConnected ? (
              <Button onClick={connect} size="lg" className="gap-2 text-base">
                <Wallet className="h-5 w-5" />
                Connect Wallet to Start
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Link to="/campaigns">
                  <Button size="lg" className="gap-2 text-base">
                    Browse Campaigns
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button size="lg" variant="outline" className="gap-2 text-base">
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="gradient-card rounded-xl border border-border/50 p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}{stat.suffix || ""}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: "01", title: "Connect", desc: "Link your Algorand wallet to get started" },
            { step: "02", title: "Enroll", desc: "Join campaigns by paying with CAMPUS tokens" },
            { step: "03", title: "Build & Submit", desc: "Create your project and get AI-evaluated" },
            { step: "04", title: "Earn", desc: "Get bounty rewards and NFT certificate" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="relative rounded-xl border border-border/50 bg-card p-6"
            >
              <span className="mb-3 block font-mono text-3xl font-bold text-primary/20">
                {item.step}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
