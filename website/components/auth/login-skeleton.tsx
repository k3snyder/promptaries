/**
 * Login Skeleton Component
 *
 * Loading skeleton for the login page with matching dimensions
 * to prevent content layout shift when LoginContent loads.
 *
 * Usage:
 * ```tsx
 * <Suspense fallback={<LoginSkeleton />}>
 *   <LoginContent />
 * </Suspense>
 * ```
 */

export function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-9 bg-muted rounded mx-auto w-3/4" />
          <div className="h-4 bg-muted rounded mx-auto w-2/3" />
        </div>

        {/* Button Skeleton */}
        <div className="space-y-4">
          <div className="h-11 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded mx-auto w-48" />
        </div>

        {/* Footer Skeleton */}
        <div className="h-3 bg-muted rounded mx-auto w-56" />
      </div>
    </div>
  );
}
