// Utility functions for location verification

interface Location {
  latitude: number
  longitude: number
}

interface CampusLocation extends Location {
  id: string
  name: string
  radius_meters: number
  wifi_ssid?: string
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Check if user is within campus location radius
 */
export function isWithinCampus(userLocation: Location, campusLocation: CampusLocation): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    campusLocation.latitude,
    campusLocation.longitude,
  )

  return distance <= campusLocation.radius_meters
}

/**
 * Get user's current location using browser's Geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}

/**
 * Find nearest campus location
 */
export function findNearestCampus(userLocation: Location, campusLocations: CampusLocation[]): CampusLocation | null {
  if (campusLocations.length === 0) return null

  let nearest = campusLocations[0]
  let minDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    nearest.latitude,
    nearest.longitude,
  )

  for (const campus of campusLocations) {
    const distance = calculateDistance(userLocation.latitude, userLocation.longitude, campus.latitude, campus.longitude)

    if (distance < minDistance) {
      minDistance = distance
      nearest = campus
    }
  }

  return nearest
}
