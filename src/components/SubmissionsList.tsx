import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Award, Loader2, ExternalLink } from "lucide-react";

interface Props {
  campaignId: string;
  isAdmin: boolean;
}

export function SubmissionsList({ campaignId, isAdmin }: Props) {
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      // In production: smart contract call to release bounty + mint NFT
      await supabase
        .from("submissions")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reward_claimed: true,
          reward_tx_hash: `mock_reward_tx_${Date.now()}`,
        })
        .eq("id", submissionId);

      // Mock NFT certificate minting
      const sub = submissions?.find((s) => s.id === submissionId);
      if (sub) {
        await supabase.from("certificates").insert({
          submission_id: submissionId,
          campaign_id: campaignId,
          student_wallet: sub.student_wallet,
          nft_asset_id: Math.floor(Math.random() * 1000000),
          tx_hash: `mock_nft_tx_${Date.now()}`,
        });
      }
    },
    onSuccess: () => {
      toast.success("Submission approved! Bounty released & NFT minted.");
      queryClient.invalidateQueries({ queryKey: ["submissions", campaignId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      await supabase
        .from("submissions")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", submissionId);
    },
    onSuccess: () => {
      toast.success("Submission rejected.");
      queryClient.invalidateQueries({ queryKey: ["submissions", campaignId] });
    },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    ai_reviewed: "bg-primary/10 text-primary border-primary/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (isLoading) return null;
  if (!submissions?.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
        No submissions yet.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-foreground">Submissions</h2>
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-xl border border-border/50 bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{sub.title}</h3>
                  <Badge variant="outline" className={statusColors[sub.status] || ""}>
                    {sub.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  by {sub.student_wallet.slice(0, 8)}...{sub.student_wallet.slice(-4)}
                </p>

                {sub.ai_score !== null && (
                  <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        AI Score: {sub.ai_score}/100
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full gradient-primary"
                          style={{ width: `${sub.ai_score}%` }}
                        />
                      </div>
                    </div>
                    {sub.ai_feedback && (
                      <p className="text-xs text-muted-foreground">{sub.ai_feedback}</p>
                    )}
                  </div>
                )}

                {sub.ipfs_hash && (
                  <a
                    href={sub.ipfs_url || `https://ipfs.io/ipfs/${sub.ipfs_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View on IPFS <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {isAdmin && sub.status === "ai_reviewed" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(sub.id)}
                    disabled={approveMutation.isPending}
                    className="gap-1"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(sub.id)}
                    disabled={rejectMutation.isPending}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              )}

              {sub.status === "approved" && sub.reward_claimed && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <Award className="mr-1 h-3 w-3" /> Rewarded
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
