"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Upload, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  course_name: string | null
  max_score: number
}

interface TaskSubmissionDialogProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

export function TaskSubmissionDialog({ task, isOpen, onClose }: TaskSubmissionDialogProps) {
  const [submissionText, setSubmissionText] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!submissionText.trim() && !attachmentUrl.trim()) {
      setError("Please provide either submission text or attachment URL")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Please sign in to submit")
      setIsSubmitting(false)
      return
    }

    const { error: submitError } = await supabase.from("task_submissions").insert({
      task_id: task.id,
      user_id: user.id,
      submission_text: submissionText.trim() || null,
      attachment_url: attachmentUrl.trim() || null,
      status: "submitted",
    })

    if (submitError) {
      console.error("[v0] Submission error:", submitError)
      setError("Failed to submit. Please try again.")
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    router.refresh()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Submit Task
          </DialogTitle>
          <DialogDescription>
            {task.title}
            {task.course_name && <span className="text-muted-foreground"> • {task.course_name}</span>}
          </DialogDescription>
        </DialogHeader>

        {task.description && (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="font-medium">Task Description:</p>
            <p className="mt-1 text-muted-foreground">{task.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission-text">Your Submission</Label>
            <Textarea
              id="submission-text"
              placeholder="Type your answer or response here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment-url" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Attachment URL (Optional)
            </Label>
            <Input
              id="attachment-url"
              type="url"
              placeholder="https://example.com/your-file.pdf"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Upload your file to a cloud service (Google Drive, Dropbox, etc.) and paste the link here
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
