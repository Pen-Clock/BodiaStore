

export default function AccountPage({searchParams,}: {searchParams?: { orderId?: string }}) {
  const orderId = searchParams?.orderId
  return (
    <div className="rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold text-gray-900">Account</h1>
      {orderId ? (
        <p className="mt-2 text-sm text-gray-700">
          Thanks! Your order was created. Order ID:{" "}
          <span className="font-semibold">{orderId}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-600">Account page (mock)</p>
      )}
    </div>
  )
}