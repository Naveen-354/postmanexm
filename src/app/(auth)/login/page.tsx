import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginForm({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const { error } = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form action={login}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
