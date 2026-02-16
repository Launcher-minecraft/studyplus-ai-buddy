import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Zap, BookOpen, FileText, Layers, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const subjects = [
  "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géographie",
  "Français", "Philosophie", "SES", "Anglais", "Espagnol", "Allemand",
];

const levels = ["Seconde", "Première", "Terminale"];

const generationTypes = [
  { id: "single", label: "1 fiche", icon: FileText, description: "Une fiche complète" },
  { id: "pack", label: "5 fiches", icon: Layers, description: "Pack de 5 fiches" },
  { id: "chapter", label: "Chapitre", icon: BookOpen, description: "Chapitre complet" },
];

export default function Dashboard() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [genType, setGenType] = useState("single");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const sheetsToday = profile?.last_generation_date === today ? profile.sheets_generated_today : 0;
  const isFree = profile?.subscription_status === "free";
  const remaining = isFree ? Math.max(0, 3 - sheetsToday) : "∞";

  const handleGenerate = async () => {
    if (!subject || !level || !topic) return;
    setIsGenerating(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8, 90));
    }, 500);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sheet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ subject, level, topic, genType }),
        }
      );

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) {
        toast({ title: "Erreur", description: data.error || "La génération a échoué.", variant: "destructive" });
        setProgress(0);
        setIsGenerating(false);
        return;
      }

      setProgress(100);
      await refreshProfile();

      toast({
        title: "Fiches générées !",
        description: `${data.sheets.length} fiche(s) créée(s) avec succès.`,
      });

      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setTopic("");
        navigate("/history");
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      toast({ title: "Erreur", description: "Impossible de générer les fiches.", variant: "destructive" });
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="absolute top-32 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {isFree ? `${remaining} fiche(s) restante(s) aujourd'hui` : "Fiches illimitées ✨"}
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Générer des fiches</h1>
            <p className="text-muted-foreground">Choisis ta matière, ton niveau et ton sujet.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Matière</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Choisis une matière" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue placeholder="Choisis ton niveau" /></SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sujet</Label>
              <Input placeholder="Ex: Les fonctions dérivées, La Révolution française..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Type de génération</Label>
              <div className="grid grid-cols-3 gap-3">
                {generationTypes.map((type) => (
                  <button key={type.id} onClick={() => setGenType(type.id)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      genType === type.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}>
                    <type.icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs font-medium block">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Génération en cours...</span>
                  <span className="text-primary font-medium">{Math.min(100, Math.round(progress))}%</span>
                </div>
                <Progress value={Math.min(100, progress)} className="h-2" />
              </motion.div>
            )}

            <Button variant="neon" className="w-full" onClick={handleGenerate}
              disabled={isGenerating || !subject || !level || !topic || (isFree && remaining === 0)}>
              <Zap className="h-4 w-4" />
              {isGenerating ? "Génération..." : "Générer les fiches"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
