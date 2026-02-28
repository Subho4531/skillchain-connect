import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, Coins, CheckCircle, Loader2 } from "lucide-react";
import { SubmitProjectDialog } from "@/components/SubmitProjectDialog";
import { SubmissionsList } from "@/components/SubmissionsList";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected, isAdmin } = useWallet();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id, address],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("*")
        .eq("campaign_id", id!)
        .eq("student_wallet", address!)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!address,
  });

  const { data: enrollmentCount } = useQuery({
    queryKey: ["enrollment-count", id],
    queryFn: async () => {
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", id!);
      return count || 0;
    },
    enabled: !!id,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      // In production: ASA transfer + app call via algosdk
      const { error } = await supabase.from("enrollments").insert({
        campaign_id: id!,
        student_wallet: address!,
        tx_hash: `mock_enroll_tx_${Date.now()}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Successfully enrolled!");
      queryClient.invalidateQueries({ queryKey: ["enrollment", id, address] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-count", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Enrollment failed");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">Campaign not found</h2>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 rounded-xl border border-border/50 bg-card p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={
                campaign.status === "active"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {campaign.status}
            </Badge>
            {isEnrolled && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle className="mr-1 h-3 w-3" /> Enrolled
              </Badge>
            )}
          </div>

          <h1 className="mb-3 text-3xl font-bold text-foreground">{campaign.title}</h1>
          <p className="mb-6 text-muted-foreground">{campaign.description}</p>

          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Coins className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Bounty/Student</p>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.bounty_per_student} CAMPUS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <p className="font-mono font-semibold text-foreground">
                  {campaign.bounty_pool} CAMPUS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="font-semibold text-foreground">
                  {enrollmentCount}/{campaign.max_students}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-semibold text-foreground">
                  {campaign.deadline
                    ? new Date(campaign.deadline).toLocaleDateString()
                    : "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {campaign.skill_tags?.map((tag: string) => (
              <span key={tag} className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>

          {isConnected && !isAdmin && !isEnrolled && campaign.status === "active" && (
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="gap-2"
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Coins className="h-4 w-4" />
              )}
              Enroll ({campaign.enrollment_fee} CAMPUS)
            </Button>
          )}

          {isConnected && isEnrolled && (
            <SubmitProjectDialog campaignId={campaign.id} studentWallet={address!} />
          )}
        </div>

        <SubmissionsList campaignId={campaign.id} isAdmin={isAdmin} />
      </motion.div>
    </div>
  );
}
