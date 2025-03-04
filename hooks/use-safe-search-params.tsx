"use client"

import type React from "react"

import { useSearchParams as useNextSearchParams } from "next/navigation"

// A simple wrapper component that renders children only on the client side
export function SafeSearchParamsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// A hook that safely returns search params or empty URLSearchParams
export function useSearchParams() {
  const searchParams = useNextSearchParams()
  return searchParams || new URLSearchParams()
}

