import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, CreditCard, Key, Zap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "",
    description: "Pour commencer à réviser",
    features: ["3 fiches par jour", "Historique basique", "Toutes les matières", "Mode clair / sombre"],
    cta: "Commencer",
    variant: "outline" as const,
    highlight: false,
  },
  {
    name: "Premium",
    price: "1,99€",
    period: "/mois",
    description: "Pour les réviseurs sérieux",
    features: ["Fiches illimitées", "Téléchargement PDF", "Chapitres complets", "Support prioritaire", "Génération par lot"],
    cta: "S'abonner",
    variant: "neon" as const,
    highlight: true,
    badge: "Populaire",
  },
  {
    name: "VIP",
    price: "Clé",
    period: "d'activation",
    description: "Accès exclusif sur invitation",
    features: ["Tout Premium inclus", "Badge VIP exclusif", "Accès anticipé", "Fonctionnalités bêta", "Support dédié"],
    cta: "Activer une clé",
    variant: "outline" as const,
    highlight: false,
  },
];

export default function Pricing() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="absolute top-32 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
            <Crown className="h-3.5 w-3.5" />
            Tarifs
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Choisis ton <span className="gradient-neon-text">plan</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Commence gratuitement, passe en illimité quand tu veux.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-primary/50 bg-card glow-cyan"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-neon-bg text-primary-foreground text-xs font-display font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {profile?.subscription_status === plan.name.toLowerCase() ? (
                <Button variant="outline" className="w-full" disabled>
                  Plan actuel
                </Button>
              ) : (
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button variant={plan.variant} className="w-full">
                    {plan.name === "VIP" && <Key className="h-4 w-4" />}
                    {plan.name === "Premium" && <CreditCard className="h-4 w-4" />}
                    {plan.name === "Gratuit" && <Zap className="h-4 w-4" />}
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          Tous les plans incluent l'accès à toutes les matières et niveaux.
        </motion.div>
      </div>
    </div>
  );
}
