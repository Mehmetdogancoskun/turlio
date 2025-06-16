'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchCtx {
  term: string
  setTerm: (v: string) => void
}

const Ctx = createContext<SearchCtx | undefined>(undefined)

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [term, setTerm] = useState('')
  return <Ctx.Provider value={{ term, setTerm }}>{children}</Ctx.Provider>
}

export const useSearch = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSearch must be inside <SearchProvider>')
  return ctx
}
