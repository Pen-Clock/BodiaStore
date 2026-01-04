
	"use client"
	
	import Image from "next/image"
	import { useRouter } from "next/navigation"
	import { useTransition } from "react"
	
	import { Button } from "@/components/ui/button"
	import { addItemToCart } from "@/lib/actions"
	
	type Product = {
	  itemId: number
	  itemName: string
	  itemPrice: number
	  itemImagePath: string | null
	}
	
	function normalizeNextImageSrc(raw: string | null) {
	  if (!raw) return null
	  const s = raw.trim().replace(/^['"]|['"]$/g, "")
	  if (!s) return null
	  if (s.startsWith("/")) return s
	
	  try {
	    const u = new URL(s)
	    if (u.protocol === "http:" || u.protocol === "https:") return s
	  } catch {
	    // ignore
	  }
	
	  return null
	}
	
	export function ProductCard({
	  p,
	  customerId,
	}: {
	  p: Product
	  customerId: number
	}) {
	  const router = useRouter()
	  const [isPending, startTransition] = useTransition()
	  const imgSrc = normalizeNextImageSrc(p.itemImagePath)
	
	  const handleAddToCart = () => {
	    startTransition(async () => {
	      await addItemToCart(customerId, p.itemId, 1)
	      router.refresh()
	    })
	  }
	
	  return (
	    <div className="w-full rounded-lg border bg-white p-4">
	      <div className="relative mb-3 aspect-4/5 w-full overflow-hidden rounded-md bg-gray-100">
	        {imgSrc ? (
	          <Image
	            src={imgSrc}
	            alt={p.itemName}
	            fill
	            className="object-cover"
	            sizes="(max-width: 768px) 100vw, 33vw"
	            loading="lazy"
	            placeholder="empty"
	          />
	        ) : (
	          <div className="h-full w-full bg-gray-100" />
	        )}
	      </div>
	
	      <div className="flex items-start justify-between gap-3">
	        <div className="min-w-0">
	          <h3 className="truncate text-sm font-medium text-gray-900">
	            {p.itemName}
	          </h3>
	          <p className="mt-1 text-sm text-gray-600">€{p.itemPrice.toFixed(2)}</p>
	        </div>
	      </div>
	
	      <Button className="mt-4 w-full" disabled={isPending} onClick={handleAddToCart}>
	        {isPending ? "Adding..." : "Add to cart"}
	      </Button>
	    </div>
	  )
	}