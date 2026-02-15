import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
      <div className="absolute top-20 left-1/3 w-72 h-72 rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-72 h-72 rounded-full bg-secondary/8 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-neon-bg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold gradient-neon-text">Study+</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Bon retour !</h1>
          <p className="text-sm text-muted-foreground mt-1">Connecte-toi pour continuer tes révisions</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button variant="neon" type="submit" className="w-full">
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
