"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarCheck, TrendingUp, Clock, AlertCircle } from "lucide-react"

interface AttendanceStatsProps {
  totalClasses: number
  attended: number
  late: number
  absent: number
}

export function AttendanceStats({ totalClasses, attended, late, absent }: AttendanceStatsProps) {
  const attendancePercentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{attendancePercentage}%</div>
          <Progress value={attendancePercentage} className="mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {attended} of {totalClasses} classes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present</CardTitle>
          <CalendarCheck className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{attended}</div>
          <p className="mt-2 text-xs text-muted-foreground">Classes attended</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Late</CardTitle>
          <Clock className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-3">{late}</div>
          <p className="mt-2 text-xs text-muted-foreground">Times late</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{absent}</div>
          <p className="mt-2 text-xs text-muted-foreground">Classes missed</p>
        </CardContent>
      </Card>
    </div>
  )
}
