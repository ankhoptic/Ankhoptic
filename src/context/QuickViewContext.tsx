"use client";
import { createContext, useContext, useState } from "react";

export type QuickViewProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  discountTitle?: string;
  images: string[];
  disposability: string | null;
  description: string | null;
  brand: { name: string; slug: string } | null;
  productType?: "LENS" | "GLASSES" | "ACCESSORY";
};

type QuickViewCtx = {
  product: QuickViewProduct | null;
  setProduct: (p: QuickViewProduct | null) => void;
};

const QuickViewContext = createContext<QuickViewCtx>({
  product: null,
  setProduct: () => {},
});

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  return (
    <QuickViewContext.Provider value={{ product, setProduct }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => useContext(QuickViewContext);
