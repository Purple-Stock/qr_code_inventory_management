"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode, Suspense } from "react"
import { useSearchParams as useNextSearchParams } from "next/navigation"

// Create a context to hold the search params
const SearchParamsContext = createContext<URLSearchParams | null>(null)

// Provider component that safely handles search params
export function SafeSearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsProviderInner>{children}</SearchParamsProviderInner>
    </Suspense>
  )
}

// Inner component that uses the hook directly
function SearchParamsProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useNextSearchParams()
  return (
    <SearchParamsContext.Provider value={searchParams as unknown as URLSearchParams}>
      {children}
    </SearchParamsContext.Provider>
  )
}

// Custom hook to use search params safely
export function useSafeSearchParams() {
  const context = useContext(SearchParamsContext)
  const [params, setParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    // On the client side, if context is null, create a URLSearchParams from window.location
    if (typeof window !== "undefined" && !context) {
      setParams(new URLSearchParams(window.location.search))
    } else {
      setParams(context)
    }
  }, [context])

  return params
}

// This component wraps the useSearchParams hook in a Suspense boundary for direct access
function SearchParamsProvider({
  children,
}: {
  children: (searchParams: URLSearchParams | null) => React.ReactNode
}) {
  const searchParams = useNextSearchParams()
  return <>{children(searchParams as URLSearchParams | null)}</>
}

// Wrapper component with Suspense for render prop pattern
export function ClientSearchParams({
  children,
  fallback = <div>Loading...</div>,
}: {
  children: (searchParams: URLSearchParams | null) => React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </Suspense>
  )
}

