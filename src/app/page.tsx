import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground text-center p-6">
      <h1 className="text-5xl font-bold tracking-tighter mb-4">APIFlow</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        Organize. Test. Save. Replay. <br />
        The complete cloud API testing platform.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  )
}
