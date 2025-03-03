"use client"

import type React from "react"

import { useSearchParams as useNextSearchParams } from "next/navigation"
import { ClientOnly } from "@/components/client-only"

export function SafeSearchParamsProvider({ children }: { children: React.ReactNode }) {
  return <ClientOnly>{children}</ClientOnly>
}

export function useSearchParams() {
  return useNextSearchParams()
}

