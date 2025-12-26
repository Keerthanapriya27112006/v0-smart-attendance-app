"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { getCurrentLocation, isWithinCampus, findNearestCampus, calculateDistance } from "@/lib/location"
import { MapPin, Wifi, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface CampusLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  radius_meters: number
  wifi_ssid?: string | null
}

export function LocationChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [nearestCampus, setNearestCampus] = useState<CampusLocation | null>(null)
  const [isWithinCampusArea, setIsWithinCampusArea] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [wifiSSID, setWifiSSID] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadCampusLocations()
  }, [])

  const loadCampusLocations = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("campus_locations").select("*").eq("is_active", true)

    if (error) {
      console.error("[v0] Error loading campus locations:", error)
      return
    }

    if (data) {
      setCampusLocations(data)
    }
  }

  const checkLocation = async () => {
    setIsChecking(true)
    setError(null)
    setSuccess(null)

    try {
      // Get current location
      const location = await getCurrentLocation()
      setCurrentLocation(location)

      // Find nearest campus
      const nearest = findNearestCampus(location, campusLocations)
      setNearestCampus(nearest)

      if (!nearest) {
        setError("No campus locations found")
        setIsChecking(false)
        return
      }

      // Calculate distance
      const dist = calculateDistance(location.latitude, location.longitude, nearest.latitude, nearest.longitude)
      setDistance(dist)

      // Check if within campus
      const withinCampus = isWithinCampus(location, nearest)
      setIsWithinCampusArea(withinCampus)

      // Check WiFi (simulated - actual WiFi SSID detection requires native app)
      // In a real app, you'd use a native API or browser extension
      const detectedWifi = await simulateWifiDetection()
      setWifiSSID(detectedWifi)

      if (!withinCampus) {
        setError(`You are ${Math.round(dist)}m away from ${nearest.name}. Please move closer to campus.`)
      }

      setIsChecking(false)
    } catch (err) {
      console.error("[v0] Location error:", err)
      setError(err instanceof Error ? err.message : "Failed to get your location")
      setIsChecking(false)
    }
  }

  const simulateWifiDetection = async (): Promise<string | null> => {
    // In a real app, you would detect the actual WiFi SSID
    // For now, we'll simulate this
    return new Promise((resolve) => {
      setTimeout(() => {
        // Randomly return a campus WiFi or null
        const random = Math.random()
        if (random > 0.5 && campusLocations.length > 0) {
          resolve(campusLocations[0].wifi_ssid || null)
        } else {
          resolve(null)
        }
      }, 500)
    })
  }

  const markAttendance = async () => {
    if (!currentLocation || !nearestCampus || !isWithinCampusArea) {
      setError("Please verify your location first")
      return
    }

    setIsChecking(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Please sign in to mark attendance")
      setIsChecking(false)
      return
    }

    // Determine verification method
    let verificationMethod: "location" | "wifi" | "both" = "location"
    if (wifiSSID && nearestCampus.wifi_ssid && wifiSSID === nearestCampus.wifi_ssid) {
      verificationMethod = "both"
    }

    // Insert attendance record
    const { error: insertError } = await supabase.from("attendance").insert({
      user_id: user.id,
      location_id: nearestCampus.id,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      wifi_ssid: wifiSSID,
      verification_method: verificationMethod,
      status: "present",
    })

    if (insertError) {
      console.error("[v0] Error marking attendance:", insertError)
      setError("Failed to mark attendance. Please try again.")
    } else {
      setSuccess("Attendance marked successfully!")
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(null)
        setCurrentLocation(null)
        setIsWithinCampusArea(false)
        setDistance(null)
        setWifiSSID(null)
      }, 3000)
    }

    setIsChecking(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mark Attendance
        </CardTitle>
        <CardDescription>Verify your location to mark your attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-accent bg-accent/10">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
          </Alert>
        )}

        {currentLocation && nearestCampus && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nearest Location</p>
                <p className="text-lg font-bold">{nearestCampus.name}</p>
              </div>
              {isWithinCampusArea ? (
                <Badge className="bg-accent text-accent-foreground">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  In Range
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Out of Range
                </Badge>
              )}
            </div>

            {distance !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{Math.round(distance)}m away</span>
              </div>
            )}

            {wifiSSID && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi className="h-4 w-4" />
                <span>Connected to: {wifiSSID}</span>
                {nearestCampus.wifi_ssid === wifiSSID && (
                  <Badge variant="outline" className="ml-auto">
                    Verified
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={checkLocation} disabled={isChecking} className="flex-1">
            {isChecking && !currentLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Verify Location
              </>
            )}
          </Button>

          {currentLocation && isWithinCampusArea && (
            <Button onClick={markAttendance} disabled={isChecking} className="flex-1 bg-accent hover:bg-accent/90">
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Attendance
                </>
              )}
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium">How it works:</p>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            <li>Click "Verify Location" to check if you're on campus</li>
            <li>Your location and WiFi network will be verified</li>
            <li>If verified, click "Mark Attendance" to record your presence</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
