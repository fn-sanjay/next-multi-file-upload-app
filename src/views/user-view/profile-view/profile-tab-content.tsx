import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithRefresh } from "@/lib/client/auth-api";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

interface ProfileTabContentProps {
  storage?: unknown;
  loading?: boolean;
}

export function ProfileTabContent({ storage: _storage }: ProfileTabContentProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { user, setUser } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetchWithRefresh("/api/user/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      toast.success("Message sent to admin");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send"));
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setSavingProfile(true);
      const res = await fetchWithRefresh("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      const data = await res.json();
      if (user) {
        setUser({
          ...user,
          name: data.user.name,
          bio: data.user.bio,
          avatar: data.user.profileImage ?? user.avatar,
        });
      }
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Profile update failed"));
    } finally {
      setSavingProfile(false);
    }
  };
 

  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Account Details</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end text-primary ">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => setEditingProfile((prev) => !prev)}
                >
                  <Pencil className="size-3.5 mr-1 text-primary" />
                  {editingProfile ? "Cancel" : "Edit"}
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullname" className="text-zinc-200">Full Name</Label>
                <Input
                  id="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-zinc-900/60 border-zinc-700 text-white"
                  disabled={!editingProfile}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-200">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  className="bg-zinc-900/60 border-zinc-700 text-white"
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-zinc-200">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="bg-zinc-900/60 border-zinc-700 text-white placeholder:text-zinc-500"
                  disabled={!editingProfile}
                />
              </div>
              <Button
                className="bg-primary text-black hover:bg-primary/90 font-bold mt-4"
                onClick={saveProfile}
                disabled={savingProfile || !editingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {!isAdmin && (
            <Card className="bg-card/60 border-zinc-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Contact Admin</CardTitle>
                <CardDescription className="text-zinc-400">
                  Share an issue or request. We’ll notify you as soon as it’s handled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-200">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Need temporary storage bump"
                    className="bg-zinc-900/60 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-200">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Describe your request"
                    className="bg-zinc-900/60 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Button
                  onClick={submitTicket}
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                >
                  {submitting ? "Sending..." : "Send to Admin"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

    </>
  );
}
