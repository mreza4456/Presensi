"use client"

import { useState, FormEvent } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/action/users"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/user-store"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (!result.success) {
      setError(result.message || "Login gagal")
    } else if (result.user) {
      // Simpan user ke Zustand
      useAuthStore.getState().setUser({
        id: result.user.id,
        email: result.user.email!,
        name: result.profile?.display_name || result.user.email!,
        profile_photo_url: result.profile?.profile_photo_url,
      })

      // Simpan permissions ke Zustand
      useAuthStore.getState().setPermissions(
        result.permissions ? result.permissions.map((p: any) => p.code) : []
      )

      setSuccess(true)
      setTimeout(() => router.push("/"), 1000)
    }

    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <h1 className="text-xl font-bold">Welcome back</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
          <p className="text-sm text-muted-foreground">Login to continue</p>
        </div>

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">
            Login successful! Redirecting...
          </p>
        )}
      </form>
    </div>
  )
}
