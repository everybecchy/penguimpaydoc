"use client"

import { useState, useCallback } from "react"
import { Copy, Check, Play, Loader2, ChevronDown, ChevronUp, Key, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMethodBg, type ApiEndpoint } from "@/lib/api-data"

interface EndpointDetailProps {
  endpoint: ApiEndpoint
  baseUrl: string
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function EndpointDetail({ endpoint, baseUrl, apiKey, onApiKeyChange }: EndpointDetailProps) {
  const [response, setResponse] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [bodyValue, setBodyValue] = useState(endpoint.body || "")
  const [copied, setCopied] = useState<string | null>(null)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showResponse, setShowResponse] = useState(false)

  const fullUrl = buildUrl(baseUrl, endpoint)

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const sendRequest = async () => {
    setLoading(true)
    setResponse(null)
    setResponseStatus(null)
    setResponseTime(null)
    setShowResponse(true)

    const startTime = performance.now()

    try {
      const headers: Record<string, string> = {}
      for (const h of endpoint.headers) {
        if (h.key === "Authorization" && apiKey) {
          headers[h.key] = `Bearer ${apiKey}`
        } else {
          headers[h.key] = h.value
        }
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      }

      if (endpoint.body && ["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        options.body = bodyValue
      }

      const res = await fetch(fullUrl, options)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponseStatus(res.status)

      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponseStatus(0)
      setResponse(
        JSON.stringify(
          { error: "Request failed", message: err instanceof Error ? err.message : "Network error or CORS issue" },
          null,
          2
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const curlCommand = buildCurl(endpoint, baseUrl, apiKey, bodyValue)
  const isInfoOnly = !!(endpoint as ApiEndpoint & { isInfoOnly?: boolean }).isInfoOnly

  return (
    <div id={endpoint.id} className="scroll-mt-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Endpoint Header */}
        <div className="flex flex-col gap-3 p-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold font-mono shrink-0",
                getMethodBg(endpoint.method)
              )}
            >
              {endpoint.method}
            </span>
            <h3 className="text-lg font-semibold text-card-foreground truncate">
              {endpoint.name}
            </h3>
          </div>
          {/* Bearer Token + Send Button row */}
          {!isInfoOnly && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  type="password"
                  placeholder="Bearer Token (sua publickey)"
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  className="w-full rounded-lg bg-muted border border-border px-3 py-2 pl-9 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button
                onClick={sendRequest}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/80 transition-colors disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loading ? "Enviando..." : "Enviar Request"}
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {endpoint.description && (
          <div className="px-5 py-4 border-b border-border">
            {isInfoOnly && (
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Informativo</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {endpoint.description}
            </p>
          </div>
        )}

        {/* URL */}
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              URL
            </span>
            <button
              onClick={() => copyToClipboard(fullUrl, "url")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy URL"
            >
              {copied === "url" ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <code className="block rounded-lg bg-muted p-3 text-sm font-mono text-foreground break-all">
            {fullUrl}
          </code>
        </div>

        {/* Headers */}
        {endpoint.headers.length > 0 && (
          <div className="px-5 py-3 border-b border-border">
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              Headers ({endpoint.headers.length})
              {showHeaders ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {showHeaders && (
              <div className="mt-2 rounded-lg bg-muted overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                        Key
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.headers.map((h, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="px-3 py-2 font-mono text-xs text-foreground">
                          {h.key}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {h.key === "Authorization" && apiKey
                            ? `Bearer ${apiKey.slice(0, 10)}...`
                            : h.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Query Params */}
        {endpoint.queryParams && endpoint.queryParams.length > 0 && (
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Query Parameters
            </span>
            <div className="mt-2 rounded-lg bg-muted overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Parameter
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.queryParams.map((qp, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0">
                      <td className="px-3 py-2 font-mono text-xs text-foreground">
                        {qp.key}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {qp.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Body */}
        {endpoint.body && (
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isInfoOnly ? "Exemplo de Payload" : "Request Body"}
              </span>
              <button
                onClick={() => copyToClipboard(bodyValue, "body")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy body"
              >
                {copied === "body" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {isInfoOnly ? (
              <pre className="rounded-lg bg-[hsl(213,60%,10%)] p-3 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto whitespace-pre-wrap">
                {bodyValue}
              </pre>
            ) : (
              <textarea
                value={bodyValue}
                onChange={(e) => setBodyValue(e.target.value)}
                rows={Math.min(bodyValue.split("\n").length + 1, 20)}
                className="w-full rounded-lg bg-muted p-3 text-sm font-mono text-foreground resize-y border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                spellCheck={false}
              />
            )}
          </div>
        )}

        {/* cURL - only for non-info endpoints */}
        {!isInfoOnly && (
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                cURL
              </span>
              <button
                onClick={() => copyToClipboard(curlCommand, "curl")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy cURL"
              >
                {copied === "curl" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <pre className="rounded-lg bg-[hsl(213,60%,10%)] p-3 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto whitespace-pre-wrap break-all">
              {curlCommand}
            </pre>
          </div>
        )}

        {/* Response - only for non-info endpoints */}
        {!isInfoOnly && showResponse && (
          <div className="px-5 py-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Response
              </span>
              {responseStatus !== null && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-bold",
                    responseStatus >= 200 && responseStatus < 300
                      ? "bg-emerald-500/10 text-emerald-600"
                      : responseStatus === 0
                      ? "bg-red-500/10 text-red-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}
                >
                  {responseStatus === 0 ? "ERR" : responseStatus}
                </span>
              )}
              {responseTime !== null && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {responseTime}ms
                </span>
              )}
              {response && (
                <button
                  onClick={() => copyToClipboard(response, "response")}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy response"
                >
                  {copied === "response" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Aguardando resposta...</span>
              </div>
            ) : response ? (
              <pre className="rounded-lg bg-[hsl(213,60%,10%)] p-3 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto max-h-96 overflow-y-auto">
                {response}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function buildUrl(baseUrl: string, endpoint: ApiEndpoint): string {
  let url = `${baseUrl}${endpoint.path}`
  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    const params = endpoint.queryParams.map((qp) => `${qp.key}=${qp.value}`).join("&")
    url += `?${params}`
  }
  return url
}

function buildCurl(
  endpoint: ApiEndpoint,
  baseUrl: string,
  apiKey: string,
  body: string
): string {
  const url = buildUrl(baseUrl, endpoint)
  let curl = `curl -X ${endpoint.method} '${url}'`

  for (const h of endpoint.headers) {
    if (h.key === "Authorization" && apiKey) {
      curl += ` \\\n  -H '${h.key}: Bearer ${apiKey}'`
    } else {
      curl += ` \\\n  -H '${h.key}: ${h.value}'`
    }
  }

  if (body && ["POST", "PUT", "PATCH"].includes(endpoint.method)) {
    curl += ` \\\n  -d '${body.replace(/\n/g, "").replace(/\s+/g, " ")}'`
  }

  return curl
}
