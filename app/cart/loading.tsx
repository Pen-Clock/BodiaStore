export default function CartLoading() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-6">
      <div className="mb-6 h-6 w-24 rounded bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between border-t pt-4">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-4 w-1/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}