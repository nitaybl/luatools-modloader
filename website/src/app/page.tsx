"use client";

import { motion } from "framer-motion";
import { Download, Terminal, FileText, ChevronRight, Settings, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";

export default function Home() {
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">LuaTools Mod Loader</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="https://nitaybbl.gitbook.io/luatools" target="_blank" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="https://github.com/nitaybl/luatools-modloader" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Terminal className="w-4 h-4" /> Source
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center max-w-3xl"
        >
          <motion.div variants={itemVars} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            v1.0.0 is now live
          </motion.div>

          <motion.h1 variants={itemVars} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gradient text-balance">
            The Ultimate Modding Engine for Steam
          </motion.h1>

          <motion.p variants={itemVars} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl text-pretty leading-relaxed">
            Inject custom CSS, run sandboxed JavaScript, and transform your Steam client with the official LuaTools Millennium Mod Loader. Built for speed, safety, and community.
          </motion.p>

          <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative glow-btn w-full sm:w-auto">
              <Link href="https://github.com/nitaybl/luatools-modloader/releases/latest" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold w-full sm:w-auto hover:bg-primary/90 transition-colors">
                <Download className="w-5 h-5" />
                Download Loader
              </Link>
            </div>
            <Link href="https://nitaybbl.gitbook.io/luatools" target="_blank" className="flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-lg font-semibold border border-border hover:bg-muted/80 transition-colors w-full sm:w-auto">
              <FileText className="w-5 h-5" />
              Read the Docs
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-2xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Mods are loaded and injected via Millennium backend streams with zero local IO blocking. Experience instantaneous UI transformations.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-2xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Sandboxed API</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every mod executes in a secured IIFE sandbox. Isolated persistence layers via getStorage() ensure mods never step on each other's toes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-8 rounded-2xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Rich Ecosystem</h3>
            <p className="text-muted-foreground leading-relaxed">
              Full lifecycle hooks, dependency resolution with topological sorting, and a global mod registry all accessible right from the PowerShell CLI.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-24 border-t border-border mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">Build the next big mod.</h2>
          <p className="text-muted-foreground mb-8">
            Check out our extensive GitBook documentation and example mods repository to get started developing for Millennium today.
          </p>
          <Link href="https://github.com/nitaybl/luatools-modloader" className="inline-flex items-center gap-2 hover:text-primary transition-colors font-medium">
            View on GitHub <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
