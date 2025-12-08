import { Skeleton } from "@/components/ui/skeleton"

export function MailsLoading() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
} 