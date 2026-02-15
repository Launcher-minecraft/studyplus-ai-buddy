import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Star, Eye, BookOpen, Calendar } from "lucide-react";

interface Sheet {
  id: string;
  title: string;
  subject: string;
  level: string;
  date: string;
  rating: number;
  preview: string;
}

const mockSheets: Sheet[] = [
  { id: "1", title: "Les fonctions dérivées", subject: "Mathématiques", level: "Terminale", date: "2026-02-14", rating: 4, preview: "Une fonction dérivée mesure le taux de variation instantané d'une fonction. Pour f(x) = xⁿ, on a f'(x) = nxⁿ⁻¹. Les règles de dérivation incluent la somme, le produit et le quotient..." },
  { id: "2", title: "La Révolution française", subject: "Histoire-Géo", level: "Première", date: "2026-02-13", rating: 5, preview: "La Révolution française (1789-1799) marque la fin de l'Ancien Régime. Les causes incluent la crise financière, les inégalités sociales et l'influence des Lumières..." },
  { id: "3", title: "L'ADN et la réplication", subject: "SVT", level: "Première", date: "2026-02-12", rating: 3, preview: "L'ADN est une molécule en double hélice composée de nucléotides. La réplication est semi-conservative : chaque brin sert de matrice pour synthétiser un nouveau brin complémentaire..." },
  { id: "4", title: "Les figures de style", subject: "Français", level: "Seconde", date: "2026-02-11", rating: 4, preview: "Les figures de style enrichissent le discours. La métaphore établit une comparaison sans outil de comparaison. L'hyperbole amplifie une idée pour marquer les esprits..." },
];

const subjects = ["Toutes", "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo", "Français", "Philosophie"];

export default function History() {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("Toutes");
  const [previewSheet, setPreviewSheet] = useState<Sheet | null>(null);

  const filtered = mockSheets.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "Toutes" || s.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Historique</h1>
          <p className="text-muted-foreground mb-8">Retrouve toutes tes fiches générées.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une fiche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((sheet, i) => (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold truncate">{sheet.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {sheet.subject}
                      </span>
                      <span>{sheet.level}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(sheet.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= sheet.rating ? "text-primary fill-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewSheet(sheet)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Aucune fiche trouvée.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Preview modal */}
      <Dialog open={!!previewSheet} onOpenChange={() => setPreviewSheet(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{previewSheet?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                {previewSheet?.subject}
              </span>
              <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">
                {previewSheet?.level}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{previewSheet?.preview}</p>
            <Button variant="neon" className="w-full">
              <Download className="h-4 w-4" />
              Télécharger en PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
