import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Star, Eye, BookOpen, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Sheet {
  id: string;
  title: string;
  subject: string;
  level: string;
  created_at: string;
  rating: number;
  content: string;
}

const subjects = ["Toutes", "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géographie", "Français", "Philosophie", "SES", "Anglais"];

export default function History() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("Toutes");
  const [previewSheet, setPreviewSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchSheets();
  }, [user]);

  const fetchSheets = async () => {
    const { data, error } = await supabase
      .from("sheets")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSheets(data as Sheet[]);
    setLoading(false);
  };

  const handleRate = async (sheetId: string, rating: number) => {
    await supabase.from("sheets").update({ rating }).eq("id", sheetId);
    setSheets((prev) => prev.map((s) => (s.id === sheetId ? { ...s, rating } : s)));
    if (previewSheet?.id === sheetId) setPreviewSheet((prev) => prev ? { ...prev, rating } : null);
  };

  const filtered = sheets.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "Toutes" || s.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const downloadPdf = (sheet: Sheet) => {
    const blob = new Blob([sheet.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheet.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Historique</h1>
          <p className="text-muted-foreground mb-8">Retrouve toutes tes fiches générées.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une fiche..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sheet, i) => (
                <motion.div key={sheet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold truncate">{sheet.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{sheet.subject}</span>
                        <span>{sheet.level}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(sheet.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => handleRate(sheet.id, star)} className="hover:scale-110 transition-transform">
                            <Star className={`h-3.5 w-3.5 ${star <= sheet.rating ? "text-primary fill-primary" : "text-muted"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setPreviewSheet(sheet)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => downloadPdf(sheet)}><Download className="h-4 w-4" /></Button>
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
          )}
        </motion.div>
      </div>

      <Dialog open={!!previewSheet} onOpenChange={() => setPreviewSheet(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{previewSheet?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{previewSheet?.subject}</span>
              <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">{previewSheet?.level}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => previewSheet && handleRate(previewSheet.id, star)} className="hover:scale-110 transition-transform">
                  <Star className={`h-4 w-4 ${star <= (previewSheet?.rating ?? 0) ? "text-primary fill-primary" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{previewSheet?.content}</div>
            <Button variant="neon" className="w-full" onClick={() => previewSheet && downloadPdf(previewSheet)}>
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
