export interface ApiEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description?: string
  headers: { key: string; value: string }[]
  body?: string
  queryParams?: { key: string; value: string }[]
  isInfoOnly?: boolean
}

export interface ApiCategory {
  name: string
  endpoints: (ApiEndpoint | ApiCategory)[]
}

export const apiCategories: ApiCategory[] = [
  {
    name: "Authentication",
    endpoints: [
      {
        id: "auth-how-it-works",
        name: "Como Autenticar",
        method: "GET" as const,
        path: "/api/*",
        isInfoOnly: true,
        description:
          "Todas as rotas protegidas da PenguimPay utilizam autenticacao via Bearer Token. Voce deve enviar sua publickey no header Authorization de todas as requisicoes no formato:\n\nAuthorization: Bearer SUA_PUBLIC_KEY\n\nA publickey e fornecida no painel da PenguimPay ao criar sua conta de integrador. Nao e necessario fazer login ou gerar token JWT - basta usar a publickey diretamente como Bearer Token em todas as chamadas da API.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ],
  },
  {
    name: "Transactions",
    endpoints: [
      {
        id: "tx-pix-in",
        name: "Gerar PIX In (Recebimento)",
        method: "POST" as const,
        path: "/api/payments/initiate",
        description:
          "Gera um pagamento PIX para receber valores. Envia os dados do cliente e o metodo de pagamento PIX. O retorno inclui o QR Code e a chave copia-e-cola para o pagador efetuar a transferencia. O status da transacao pode ser acompanhado via webhook ou pelo endpoint de status.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
        body: JSON.stringify(
          {
            productId: "produto_id_aqui",
            customerData: {
              name: "Joao Silva",
              email: "joao@email.com",
              number: "11999999999",
              document: "123.456.789-00",
              zipCode: "01234-567",
              adress: "Rua Exemplo, 123",
              city: "Sao Paulo",
              state: "SP",
            },
            paymentMethod: "PIX",
          },
          null,
          2
        ),
      },
      {
        id: "tx-pix-out",
        name: "Gerar PIX Out (Saque/Envio)",
        method: "POST" as const,
        path: "/api/withdrawals",
        description:
          "Solicita um PIX Out (saque ou envio de valores) do saldo disponivel na carteira. Informe o valor e a chave PIX de destino. O saque sera processado e o status pode ser acompanhado via webhook. O valor liquido sera debitado da carteira do seller apos descontar as taxas aplicaveis.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
        body: JSON.stringify(
          {
            amount: 150.5,
            pixKey: "123.456.789-09",
          },
          null,
          2
        ),
      },
      {
        id: "tx-compliance",
        name: "Compliance",
        method: "GET" as const,
        path: "/api/compliance/*",
        isInfoOnly: true,
        description:
          "A PenguimPay possui endpoints de compliance para gerenciar a seguranca das transacoes. Os endpoints disponiveis sao:\n\n- GET /api/compliance/stats - Retorna estatisticas gerais de compliance\n- GET /api/compliance/under-review - Lista transacoes em analise\n- GET /api/compliance/fraudulent - Lista transacoes marcadas como fraude\n- GET /api/compliance/refunded - Lista transacoes estornadas (aceita ?page=1&limit=10)\n- POST /api/compliance/flag - Marca transacao para analise (body: transactionId, reason)\n- POST /api/compliance/approve - Aprova transacao em analise (body: transactionId)\n- POST /api/compliance/reject - Rejeita transacao em analise (body: transactionId, reason)\n- POST /api/compliance/refund - Estorna transacao (body: transactionId, reason)\n\nTodos os endpoints de compliance exigem o header Authorization: Bearer SUA_PUBLIC_KEY. Os endpoints POST de flag, approve, reject e refund exigem permissao de admin.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ],
  },
  {
    name: "Webhooks",
    endpoints: [
      {
        id: "webhook-payload",
        name: "Webhook - Payload de Eventos",
        method: "POST" as const,
        path: "/sua-url-de-webhook",
        isInfoOnly: true,
        description:
          "A PenguimPay envia notificacoes automaticas para a URL configurada no seu webhook sempre que o status de uma transacao muda. O payload e enviado via POST com Content-Type application/json. Os principais eventos sao: APPROVED (pagamento confirmado), PENDING (aguardando pagamento), EXPIRED (expirado), REFUNDED (estornado), FAILED (falha). Voce deve responder com status 200 para confirmar o recebimento. Caso contrario, a PenguimPay fara ate 3 tentativas de reenvio.",
        headers: [{ key: "Content-Type", value: "application/json" }],
        body: JSON.stringify(
          {
            transactionId: "tx_123",
            status: "APPROVED",
            externalTransactionId: "versell_456",
            metadata: {
              amount: 99.9,
              currency: "BRL",
              paymentMethod: "PIX",
              timestamp: "2024-01-15T10:30:00Z",
            },
          },
          null,
          2
        ),
      },
    ],
  },
]

export function flattenEndpoints(
  categories: ApiCategory[]
): ApiEndpoint[] {
  const result: ApiEndpoint[] = []
  for (const cat of categories) {
    for (const ep of cat.endpoints) {
      if ("id" in ep) {
        result.push(ep as ApiEndpoint)
      }
    }
  }
  return result
}

export function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return "text-emerald-400"
    case "POST":
      return "text-sky-400"
    case "PUT":
      return "text-amber-400"
    case "DELETE":
      return "text-red-400"
    case "PATCH":
      return "text-orange-400"
    default:
      return "text-muted-foreground"
  }
}

export function getMethodBg(method: string): string {
  switch (method) {
    case "GET":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "POST":
      return "bg-sky-500/10 text-sky-600 border-sky-500/20"
    case "PUT":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case "DELETE":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case "PATCH":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}
