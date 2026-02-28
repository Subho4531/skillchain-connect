import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Plus, Loader2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const { isConnected, isAdmin, address } = useWallet();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [enrollmentFee, setEnrollmentFee] = useState("10");
  const [bountyPerStudent, setBountyPerStudent] = useState("100");
  const [maxStudents, setMaxStudents] = useState("50");
  const [deadline, setDeadline] = useState("");

  const { data: campaigns } = useQuery({
    queryKey: ["admin-campaigns", address],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("creator_wallet", address!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!address,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert({
        creator_wallet: address!,
        title: title.trim(),
        description: description.trim(),
        skill_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        enrollment_fee: parseInt(enrollmentFee),
        bounty_per_student: parseInt(bountyPerStudent),
        bounty_pool: parseInt(bountyPerStudent) * parseInt(maxStudents),
        max_students: parseInt(maxStudents),
        status: "active",
        deadline: deadline || null,
        tx_hash: `mock_create_tx_${Date.now()}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign created!");
      setTitle("");
      setDescription("");
      setTags("");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!isConnected) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Connect your admin wallet to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create Campaign */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Web3 DApp Challenge" maxLength={100} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Build a decentralized application..." rows={4} maxLength={1000} />
              </div>
              <div>
                <Label>Skill Tags (comma separated)</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="solidity, react, web3" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Enrollment Fee</Label>
                  <Input type="number" value={enrollmentFee} onChange={(e) => setEnrollmentFee(e.target.value)} />
                </div>
                <div>
                  <Label>Bounty/Student</Label>
                  <Input type="number" value={bountyPerStudent} onChange={(e) => setBountyPerStudent(e.target.value)} />
                </div>
                <div>
                  <Label>Max Students</Label>
                  <Input type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!title || !description || createMutation.isPending}
                className="w-full gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Campaign
              </Button>
            </CardContent>
          </Card>

          {/* My Campaigns */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-foreground">Your Campaigns</h2>
            {campaigns?.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                No campaigns created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns?.map((c) => (
                  <Link key={c.id} to={`/campaigns/${c.id}`}>
                    <div className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">{c.title}</h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            c.status === "active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.max_students} spots · {c.bounty_per_student} CAMPUS/student
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
