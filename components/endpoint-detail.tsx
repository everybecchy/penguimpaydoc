"use client"

import { useState, useCallback, useEffect } from "react"
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
  const [activeCodeTab, setActiveCodeTab] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  // Initialize form values from body
  useEffect(() => {
    if (endpoint.formFields && endpoint.body) {
      try {
        const parsed = JSON.parse(endpoint.body)
        const values: Record<string, string> = {}
        for (const field of endpoint.formFields) {
          if (field.nested) {
            values[field.key] = parsed[field.nested]?.[field.key]?.toString() || ""
          } else {
            values[field.key] = parsed[field.key]?.toString() || ""
          }
        }
        setFormValues(values)
      } catch {
        // ignore
      }
    }
  }, [endpoint.id, endpoint.formFields, endpoint.body])

  // Build body from form values
  const updateBodyFromForm = useCallback(
    (key: string, value: string) => {
      const newValues = { ...formValues, [key]: value }
      setFormValues(newValues)

      if (!endpoint.formFields) return

      try {
        const parsed = endpoint.body ? JSON.parse(endpoint.body) : {}
        for (const field of endpoint.formFields) {
          const val = field.key === key ? value : (newValues[field.key] || "")
          if (field.nested) {
            if (!parsed[field.nested]) parsed[field.nested] = {}
            parsed[field.nested][field.key] = field.type === "number" ? (parseFloat(val) || 0) : val
          } else {
            parsed[field.key] = field.type === "number" ? (parseFloat(val) || 0) : val
          }
        }
        setBodyValue(JSON.stringify(parsed, null, 2))
      } catch {
        // ignore
      }
    },
    [formValues, endpoint.formFields, endpoint.body]
  )

  const fullUrl = buildUrl(baseUrl, endpoint, formValues)

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

  const isInfoOnly = !!endpoint.isInfoOnly
  const codeExamples = endpoint.codeExamples || []
  const webhookPayloads = endpoint.webhookPayloads || []

  const getCodeWithKey = (code: string) => {
    if (apiKey) {
      return code.replace(/SUA_PUBLIC_KEY/g, apiKey)
    }
    return code
  }

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

        {/* Form Fields */}
        {endpoint.formFields && endpoint.formFields.length > 0 && !isInfoOnly && (
          <div className="px-5 py-4 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Parametros
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {endpoint.formFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`${endpoint.id}-${field.key}`}
                    className="text-xs font-medium text-foreground"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`${endpoint.id}-${field.key}`}
                    type={field.type === "number" ? "text" : "text"}
                    inputMode={field.type === "number" ? "decimal" : "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ""}
                    onChange={(e) => updateBodyFromForm(field.key, e.target.value)}
                    className="rounded-lg bg-muted border border-border px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Body (JSON textarea) */}
        {endpoint.body && !isInfoOnly && (
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Request Body (JSON)
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
            <textarea
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
              rows={Math.min(bodyValue.split("\n").length + 1, 20)}
              className="w-full rounded-lg bg-muted p-3 text-sm font-mono text-foreground resize-y border border-border focus:outline-none focus:ring-1 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        )}

        {/* Webhook Payloads */}
        {webhookPayloads.length > 0 && (
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Exemplos de Payload
            </span>
            <div className="flex flex-col gap-4">
              {webhookPayloads.map((wp, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{wp.title}</span>
                    <button
                      onClick={() => copyToClipboard(wp.payload, `wp-${idx}`)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Copy ${wp.title}`}
                    >
                      {copied === `wp-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="rounded-lg bg-[hsl(213,60%,10%)] p-4 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto whitespace-pre-wrap">
                    {wp.payload}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Examples - Multi-language tabs */}
        {codeExamples.length > 0 && (
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Exemplos de Codigo
              </span>
              {codeExamples[activeCodeTab] && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      getCodeWithKey(codeExamples[activeCodeTab].code),
                      `code-${activeCodeTab}`
                    )
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied === `code-${activeCodeTab}` ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Language Tabs */}
            <div className="flex gap-0 rounded-t-lg overflow-hidden border border-b-0 border-[hsl(213,50%,20%)]">
              {codeExamples.map((example, idx) => (
                <button
                  key={example.language}
                  onClick={() => setActiveCodeTab(idx)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium transition-colors border-r border-[hsl(213,50%,20%)] last:border-r-0",
                    activeCodeTab === idx
                      ? "bg-[hsl(213,60%,10%)] text-[hsl(207,90%,70%)]"
                      : "bg-[hsl(213,55%,15%)] text-[hsl(210,20%,55%)] hover:text-[hsl(210,20%,75%)] hover:bg-[hsl(213,55%,13%)]"
                  )}
                >
                  {example.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            {codeExamples[activeCodeTab] && (
              <pre className="rounded-b-lg border border-t-0 border-[hsl(213,50%,20%)] bg-[hsl(213,60%,10%)] p-4 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto whitespace-pre-wrap">
                {getCodeWithKey(codeExamples[activeCodeTab].code)}
              </pre>
            )}
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

function buildUrl(baseUrl: string, endpoint: ApiEndpoint, formValues?: Record<string, string>): string {
  let path = endpoint.path

  // Replace :transactionId in path if form value exists
  if (formValues?.transactionId) {
    path = path.replace(":transactionId", formValues.transactionId)
  }

  let url = `${baseUrl}${path}`
  if (endpoint.queryParams && endpoint.queryParams.length > 0) {
    const params = endpoint.queryParams.map((qp) => `${qp.key}=${qp.value}`).join("&")
    url += `?${params}`
  }
  return url
}
