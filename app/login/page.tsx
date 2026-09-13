export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-medium text-primary">Purple Cloud</p>
          <h1 className="text-3xl font-semibold tracking-tight text-card-foreground">
            Sign in to Purple Cloud
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue to your design workspace.
          </p>
        </div>

        <a
          href="/api/auth/sign-in?next=/backup"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Continue with Google
        </a>
      </div>
    </main>
  )
}
