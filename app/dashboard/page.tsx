import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AttendanceStats } from "@/components/dashboard/attendance-stats"
import { AttendanceHistory } from "@/components/dashboard/attendance-history"
import { LocationChecker } from "@/components/attendance/location-checker"
import { TaskList } from "@/components/tasks/task-list"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get attendance records
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select(
      `
      *,
      campus_locations(name)
    `,
    )
    .eq("user_id", user.id)
    .order("check_in_time", { ascending: false })
    .limit(20)

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      *,
      task_submissions!task_submissions_task_id_fkey(
        id,
        status,
        score,
        submitted_at
      )
    `,
    )
    .eq("task_submissions.user_id", user.id)
    .order("due_date", { ascending: true })

  // Calculate stats
  const totalClasses = attendanceRecords?.length || 0
  const attended = attendanceRecords?.filter((r) => r.status === "present").length || 0
  const late = attendanceRecords?.filter((r) => r.status === "late").length || 0
  const absent = attendanceRecords?.filter((r) => r.status === "absent").length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 p-6">
        <DashboardHeader userName={profile?.full_name || "Student"} studentId={profile?.student_id || undefined} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <LocationChecker />
          </div>

          <div className="space-y-6">
            <AttendanceHistory records={attendanceRecords || []} />
          </div>
        </div>

        <AttendanceStats totalClasses={totalClasses} attended={attended} late={late} absent={absent} />

        <TaskList tasks={tasks || []} />
      </div>
    </div>
  )
}
