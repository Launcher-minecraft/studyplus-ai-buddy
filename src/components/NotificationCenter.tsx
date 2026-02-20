import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

function getNotifications(profile: any): Notification[] {
  const notifs: Notification[] = [];
  const now = new Date();

  if (profile?.subscription_status === "free") {
    const remaining = profile.sheets_generated_today >= 3 ? 0 : 3 - profile.sheets_generated_today;
    if (remaining === 0) {
      notifs.push({
        id: "limit",
        title: "Limite atteinte",
        message: "Tu as utilisé tes 3 fiches gratuites aujourd'hui. Passe en Premium pour continuer !",
        time: "Aujourd'hui",
        read: false,
      });
    } else if (remaining === 1) {
      notifs.push({
        id: "almost",
        title: "Dernière fiche",
        message: "Il te reste 1 fiche gratuite aujourd'hui.",
        time: "Aujourd'hui",
        read: false,
      });
    }
  }

  if (profile?.subscription_status === "vip") {
    notifs.push({
      id: "vip",
      title: "Statut VIP actif ✨",
      message: "Tu as un accès illimité à toutes les fonctionnalités.",
      time: "Actif",
      read: true,
    });
  }

  notifs.push({
    id: "welcome",
    title: "Bienvenue sur Study+ !",
    message: "Génère ta première fiche de révision depuis le Dashboard.",
    time: "Début",
    read: true,
  });

  return notifs;
}

export function NotificationCenter() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const notifications = getNotifications(profile);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full gradient-neon-bg text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
