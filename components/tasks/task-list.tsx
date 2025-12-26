"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow, isPast, parseISO } from "date-fns"
import { FileText, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { TaskSubmissionDialog } from "./task-submission-dialog"

interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  course_name: string | null
  max_score: number
  task_submissions: Array<{
    id: string
    status: string
    score: number | null
    submitted_at: string
  }>
}

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmitClick = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const getTaskStatus = (task: Task) => {
    const submission = task.task_submissions[0]
    if (submission) {
      if (submission.status === "graded" && submission.score !== null) {
        return {
          label: `Graded: ${submission.score}/${task.max_score}`,
          variant: "default" as const,
          color: "bg-accent text-accent-foreground",
        }
      }
      return {
        label: "Submitted",
        variant: "default" as const,
        color: "bg-primary text-primary-foreground",
      }
    }

    if (task.due_date && isPast(parseISO(task.due_date))) {
      return {
        label: "Overdue",
        variant: "destructive" as const,
        color: "",
      }
    }

    return {
      label: "Pending",
      variant: "outline" as const,
      color: "",
    }
  }

  return (
    <>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            My Tasks
          </CardTitle>
          <CardDescription>View and submit your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {tasks.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No tasks assigned yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const status = getTaskStatus(task)
                  const submission = task.task_submissions[0]
                  const isSubmitted = !!submission
                  const isOverdue = task.due_date && isPast(parseISO(task.due_date))

                  return (
                    <div key={task.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <Badge variant={status.variant} className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                              {task.course_name && (
                                <p className="mt-1 text-sm text-muted-foreground">{task.course_name}</p>
                              )}
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span className={isOverdue && !isSubmitted ? "text-destructive" : ""}>
                                  Due {formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                            {submission && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Submitted{" "}
                                  {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {!isSubmitted ? (
                            <Button onClick={() => handleSubmitClick(task)} size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Submit
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-accent">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTask && (
        <TaskSubmissionDialog
          task={selectedTask}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedTask(null)
          }}
        />
      )}
    </>
  )
}
