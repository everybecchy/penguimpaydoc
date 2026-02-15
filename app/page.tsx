"use client"

import { useState, useRef, useCallback } from "react"
import { DocSidebar, MobileMenuButton } from "@/components/doc-sidebar"
import { EndpointDetail } from "@/components/endpoint-detail"
import { DocWelcome } from "@/components/doc-welcome"
import { apiCategories, flattenEndpoints, type ApiEndpoint } from "@/lib/api-data"

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState("https://app.penguimpay.com")
  const [apiKey, setApiKey] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const allEndpoints = flattenEndpoints(apiCategories)

  const selectedEndpoint = allEndpoints.find((ep) => ep.id === activeEndpoint) || null

  const handleSelectEndpoint = useCallback((id: string) => {
    setActiveEndpoint(id)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DocSidebar
        activeEndpoint={activeEndpoint}
        onSelectEndpoint={handleSelectEndpoint}
        baseUrl={baseUrl}
        onBaseUrlChange={setBaseUrl}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 overflow-y-auto" ref={contentRef}>
        <MobileMenuButton onClick={() => setMobileOpen(true)} />

        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8 lg:py-10">
          {selectedEndpoint ? (
            <div className="space-y-6">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  onClick={() => setActiveEndpoint(null)}
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </button>
                <span>{"/"}</span>
                <span className="text-foreground font-medium">
                  {getCategoryForEndpoint(selectedEndpoint.id)}
                </span>
                <span>{"/"}</span>
                <span className="text-foreground font-medium">
                  {selectedEndpoint.name}
                </span>
              </nav>

              <EndpointDetail
                key={selectedEndpoint.id}
                endpoint={selectedEndpoint}
                baseUrl={baseUrl}
                apiKey={apiKey}
              />
            </div>
          ) : (
            <DocWelcome />
          )}
        </div>
      </main>
    </div>
  )
}

function getCategoryForEndpoint(endpointId: string): string {
  for (const category of apiCategories) {
    for (const ep of category.endpoints) {
      if ("id" in ep && (ep as ApiEndpoint).id === endpointId) {
        return category.name
      }
    }
  }
  return ""
}
