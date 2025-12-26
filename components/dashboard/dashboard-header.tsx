"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GraduationCap, LogOut } from "lucide-react"

interface DashboardHeaderProps {
  userName: string
  studentId?: string
}

export function DashboardHeader({ userName, studentId }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 border-b bg-card pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{userName}</h1>
          {studentId && <p className="text-sm text-muted-foreground">ID: {studentId}</p>}
        </div>
      </div>
      <Button onClick={handleSignOut} variant="outline">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  )
}
