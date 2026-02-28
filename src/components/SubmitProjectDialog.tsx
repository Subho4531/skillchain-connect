import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Loader2, Sparkles } from "lucide-react";

interface Props {
  campaignId: string;
  studentWallet: string;
}

export function SubmitProjectDialog({ campaignId, studentWallet }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Mock IPFS upload (replace with Pinata in production)
      const mockIpfsHash = `Qm${Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join("")}`;

      // 2. Insert submission
      const { data: submission, error: insertError } = await supabase
        .from("submissions")
        .insert({
          campaign_id: campaignId,
          student_wallet: studentWallet,
          title,
          description,
          ipfs_hash: mockIpfsHash,
          ipfs_url: `https://ipfs.io/ipfs/${mockIpfsHash}`,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Call AI evaluation
      const { data: evalData, error: evalError } = await supabase.functions.invoke("evaluate-submission", {
        body: { submissionId: submission.id, title, description },
      });

      if (evalError) {
        console.error("AI evaluation failed:", evalError);
        toast.info("Submission saved. AI evaluation will be retried.");
      } else if (evalData) {
        // Update submission with AI results
        await supabase
          .from("submissions")
          .update({
            ai_score: evalData.score,
            ai_feedback: evalData.feedback,
            status: "ai_reviewed",
          })
          .eq("id", submission.id);
      }

      return submission;
    },
    onSuccess: () => {
      toast.success("Project submitted successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Submission failed");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Submit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Submit Your Project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="My awesome project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project, what you built, technologies used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This will be evaluated by AI for scoring and feedback.
            </p>
          </div>
          <div>
            <Label htmlFor="file">Project File (optional)</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Will be uploaded to IPFS via Pinata.
            </p>
          </div>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!title || !description || submitMutation.isPending}
            className="w-full gap-2"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting & Evaluating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Submit & Get AI Evaluation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
