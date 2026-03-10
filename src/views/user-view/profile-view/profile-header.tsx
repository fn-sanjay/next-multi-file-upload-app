import { Camera, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useMemo, useRef, useState } from "react";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";

export function ProfileHeader() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
    return letters.join("") || "U";
  }, [user?.name]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
      <div className="relative group">
        <Avatar className="size-32 border-2 border-zinc-800 ring-4 ring-black">
          <AvatarImage src={user?.avatar} alt={user?.name ?? "User"} />
          <AvatarFallback className="text-4xl bg-zinc-900">{initials}</AvatarFallback>
        </Avatar>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = async () => {
              if (typeof reader.result === "string") {
                if (!user) {
                  toast.error("Please wait for profile to load");
                  return;
                }
                try {
                  setUploading(true);
                  const res = await fetchWithRefresh("/api/user/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: user?.name ?? "", bio: user?.bio ?? "", avatarUrl: reader.result }),
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to upload avatar");
                  }
                  const data = await res.json();
                  setUser({
                    ...user!,
                    avatar: data.user.profileImage,
                    name: data.user.name,
                    bio: data.user.bio,
                  });
                  toast.success("Profile image updated");
                } catch (err: any) {
                  toast.error(err?.message || "Upload failed");
                } finally {
                  setUploading(false);
                }
              }
            };
            reader.readAsDataURL(file);
          }}
        />
        <button
          className="absolute bottom-1 right-1 p-2 bg-primary text-black rounded-full shadow-xl hover:scale-110 transition-transform border-4 border-black"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-white">
              {user?.name ?? "Your Name"}
            </h1>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
            >
              {user ? "Member" : "Guest"}
            </Badge>
          </div>
          <p className="text-zinc-500 font-medium flex items-center gap-2">
            <Mail className="size-4" />
            {user?.email ?? "you@example.com"}
          </p>
          {user?.bio && (
            <p className="text-sm text-zinc-400 max-w-xl">{user.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
