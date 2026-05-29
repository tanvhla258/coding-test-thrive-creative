import Skeleton from "./Skeleton";

export default function TicketSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-1.5" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex items-center justify-end">
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}
