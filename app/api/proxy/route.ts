import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, method, headers, requestBody } = body

    if (!url || !method) {
      return NextResponse.json(
        { error: "Missing url or method" },
        { status: 400 }
      )
    }

    // Only allow proxying to the PenguimPay API
    const allowedOrigins = ["https://api.penguimpay.com"]
    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin))

    if (!isAllowed) {
      return NextResponse.json(
        { error: "URL not allowed" },
        { status: 403 }
      )
    }

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
    }

    if (requestBody && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOptions.body =
        typeof requestBody === "string"
          ? requestBody
          : JSON.stringify(requestBody)
    }

    const startTime = performance.now()
    const response = await fetch(url, fetchOptions)
    const endTime = performance.now()

    const responseText = await response.text()

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      body: responseText,
      time: Math.round(endTime - startTime),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
