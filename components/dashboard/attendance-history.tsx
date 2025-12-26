"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Wifi, Clock } from "lucide-react"

interface AttendanceRecord {
  id: string
  check_in_time: string
  status: "present" | "late" | "absent"
  verification_method: "location" | "wifi" | "both"
  campus_locations: {
    name: string
  } | null
  wifi_ssid: string | null
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-accent text-accent-foreground">Present</Badge>
      case "late":
        return <Badge className="bg-chart-3 text-white">Late</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
        <CardDescription>Your recent attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {records.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No attendance records yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{record.campus_locations?.name || "Unknown Location"}</p>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(record.check_in_time), { addSuffix: true })}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                      {record.verification_method && (
                        <div className="flex items-center gap-1">
                          {record.verification_method.includes("location") ? (
                            <MapPin className="h-3 w-3" />
                          ) : (
                            <Wifi className="h-3 w-3" />
                          )}
                          <span>
                            {record.verification_method === "both"
                              ? "Location + WiFi"
                              : record.verification_method === "location"
                                ? "Location"
                                : "WiFi"}
                          </span>
                        </div>
                      )}
                      {record.wifi_ssid && (
                        <div className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          <span>{record.wifi_ssid}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(record.check_in_time).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
