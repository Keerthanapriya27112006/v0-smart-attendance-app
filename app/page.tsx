import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, CheckCircle, ListTodo, GraduationCap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Smart Attendance System</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Mark your attendance remotely using location verification. Stay updated with your tasks and submissions, all
            in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Location Verified</CardTitle>
              <CardDescription>Mark attendance from anywhere on campus using GPS and WiFi verification</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Real-time location tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Campus WiFi detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Secure and accurate</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <ListTodo className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>View assigned tasks and submit your work directly from your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>View all assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Submit work online</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Track submission status</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                <GraduationCap className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>Monitor your attendance rate and academic performance in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Attendance analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>Performance insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <span>History records</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
