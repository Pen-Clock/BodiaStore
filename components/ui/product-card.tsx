'use client';
import { Button } from '@/components/ui/button';

export function ProductCard({ p }: { p: { id: number; name: string; price: number } }) {
  return (
    <div className="rounded border p-4 w-64">
      <div className="bg-gray-200 h-40 rounded mb-2" />
      <h3 className="font-semibold">{p.name}</h3>
      <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
      <Button className="mt-2 w-full">Add to cart</Button>
    </div>
  );
}