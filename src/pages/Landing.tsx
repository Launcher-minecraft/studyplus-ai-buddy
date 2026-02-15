import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Brain, Clock, Star, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Puissante",
    description: "Génération de fiches de révision intelligentes adaptées à ton niveau.",
  },
  {
    icon: Clock,
    title: "En quelques secondes",
    description: "Obtiens tes fiches instantanément, prêtes à réviser.",
  },
  {
    icon: Star,
    title: "Personnalisées",
    description: "Choisis ta matière, ton niveau et ton sujet pour des fiches sur mesure.",
  },
];

const subjects = [
  "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo",
  "Français", "Philosophie", "SES", "Anglais",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <Zap className="h-3.5 w-3.5" />
              Propulsé par l'Intelligence Artificielle
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="gradient-neon-text">Study+</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-display mb-2">
              Révise plus, mieux, vite.
            </p>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10">
              La plateforme qui génère des fiches de révision personnalisées grâce à l'IA.
              Pour les lycéens de la Seconde à la Terminale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="neon" size="lg" className="text-base px-8">
                  <Zap className="h-5 w-5" />
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="neon-outline" size="lg" className="text-base px-8">
                  Se connecter
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subjects ticker */}
      <section className="py-8 border-y border-border overflow-hidden">
        <div className="flex gap-6 animate-[scroll_20s_linear_infinite]">
          {[...subjects, ...subjects].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-muted-foreground"
            >
              <BookOpen className="h-4 w-4 text-primary/60" />
              <span className="text-sm font-medium">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pourquoi <span className="gradient-neon-text">Study+</span> ?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Des outils conçus pour maximiser l'efficacité de tes révisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:glow-cyan transition-shadow">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tarifs <span className="gradient-neon-text">simples</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-1">Gratuit</h3>
              <p className="text-3xl font-display font-bold mb-4">0€</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ 3 fiches par jour</li>
                <li>✓ Historique basique</li>
                <li>✓ Toutes les matières</li>
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full">Commencer</Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-xl border border-primary/50 bg-card p-6 relative glow-cyan">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-neon-bg text-primary-foreground text-xs font-display font-semibold px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">Premium</h3>
              <p className="text-3xl font-display font-bold mb-1">1,99€<span className="text-sm text-muted-foreground font-normal">/mois</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ Fiches illimitées</li>
                <li>✓ Téléchargement PDF</li>
                <li>✓ Chapitres complets</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <Button variant="neon" className="w-full">S'abonner</Button>
            </div>

            {/* VIP */}
            <div className="rounded-xl border border-secondary/50 bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-1">VIP</h3>
              <p className="text-3xl font-display font-bold mb-1">Clé<span className="text-sm text-muted-foreground font-normal ml-2">d'activation</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ Tout Premium</li>
                <li>✓ Badge VIP exclusif</li>
                <li>✓ Accès anticipé</li>
              </ul>
              <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary/10">Activer une clé</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-display font-bold gradient-neon-text">Study+</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Study+. Révise plus, mieux, vite.
          </p>
        </div>
      </footer>
    </div>
  );
}
