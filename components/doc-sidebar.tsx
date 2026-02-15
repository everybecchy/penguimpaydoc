"use client"

import { useState } from "react"
import { ChevronRight, Search, Key, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiCategories, getMethodColor, type ApiEndpoint } from "@/lib/api-data"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocSidebarProps {
  activeEndpoint: string | null
  onSelectEndpoint: (id: string) => void
  baseUrl: string
  onBaseUrlChange: (url: string) => void
  apiKey: string
  onApiKeyChange: (key: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function DocSidebar({
  activeEndpoint,
  onSelectEndpoint,
  baseUrl,
  onBaseUrlChange,
  apiKey,
  onApiKeyChange,
  mobileOpen,
  onMobileClose,
}: DocSidebarProps) {
  const [search, setSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(apiCategories.map((c) => c.name))
  )

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const filteredCategories = apiCategories
    .map((category) => {
      const filteredEndpoints = category.endpoints.filter((ep) => {
        if (!("id" in ep)) return false
        const endpoint = ep as ApiEndpoint
        const term = search.toLowerCase()
        return (
          endpoint.name.toLowerCase().includes(term) ||
          endpoint.path.toLowerCase().includes(term) ||
          endpoint.method.toLowerCase().includes(term)
        )
      })
      return { ...category, endpoints: filteredEndpoints }
    })
    .filter((c) => c.endpoints.length > 0)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-80 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logotipo%20Design%20%285%29-t3S2Z5N6XGgW6o3oU6VuONDsWAX3hP.png"
            alt="PenguimPay Logo"
            className="h-10 w-10 rounded-lg object-contain bg-sidebar-accent"
          />
          <div>
            <h1 className="text-base font-semibold text-sidebar-primary-foreground">PenguimPay</h1>
            <span className="text-xs text-sidebar-foreground/60">API Documentation</span>
          </div>
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* API Key Config */}
        <div className="px-4 py-3 border-b border-sidebar-border space-y-2">
          <div className="relative">
            <Key className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sidebar-foreground/40" />
            <input
              type="password"
              placeholder="Bearer Token"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className="w-full rounded-md bg-sidebar-accent border border-sidebar-border px-3 py-2 pl-8 text-xs text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-ring font-mono"
            />
          </div>
          <input
            type="text"
            placeholder="Base URL"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            className="w-full rounded-md bg-sidebar-accent border border-sidebar-border px-3 py-2 text-xs text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-ring font-mono"
          />
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sidebar-foreground/40" />
            <input
              type="text"
              placeholder="Buscar endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md bg-sidebar-accent border border-sidebar-border px-3 py-2 pl-8 text-xs text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-0.5">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      expandedCategories.has(category.name) && "rotate-90"
                    )}
                  />
                  {category.name}
                  <span className="ml-auto text-[10px] font-normal bg-sidebar-accent rounded px-1.5 py-0.5">
                    {category.endpoints.length}
                  </span>
                </button>
                {expandedCategories.has(category.name) && (
                  <div className="ml-3 space-y-0.5 mb-1">
                    {category.endpoints.map((ep) => {
                      if (!("id" in ep)) return null
                      const endpoint = ep as ApiEndpoint
                      return (
                        <button
                          key={endpoint.id}
                          onClick={() => {
                            onSelectEndpoint(endpoint.id)
                            onMobileClose()
                          }}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs transition-colors text-left",
                            activeEndpoint === endpoint.id
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold w-11 shrink-0",
                              activeEndpoint === endpoint.id
                                ? "text-sidebar-primary-foreground/80"
                                : getMethodColor(endpoint.method)
                            )}
                          >
                            {endpoint.method}
                          </span>
                          <span className="truncate">{endpoint.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/40">
          PenguimPay API v1.0
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-30 rounded-lg bg-card border border-border p-2 shadow-md"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </button>
  )
}
