export interface CodeExample {
  language: string
  label: string
  code: string
}

export interface FormField {
  key: string
  label: string
  placeholder: string
  type: "text" | "number"
  nested?: string
}

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
  codeExamples?: CodeExample[]
  formFields?: FormField[]
  webhookPayloads?: { title: string; payload: string }[]
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
          "Todas as rotas da API PenguimPay utilizam autenticacao via Bearer Token.\n\nVoce deve enviar sua publickey no header Authorization de todas as requisicoes, no seguinte formato:\n\nAuthorization: Bearer SUA_PUBLIC_KEY\n\nA publickey e fornecida no painel da PenguimPay ao criar sua conta de integrador.\n\nNao e necessario fazer login ou gerar token JWT — basta usar a publickey diretamente como Bearer Token em todas as chamadas.\n\nEndpoint base: https://api.penguimpay.com\n\nExemplo de header obrigatorio em todas as requests:\n\n  Authorization: Bearer pk_sua_chave_aqui\n  Content-Type: application/json",
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
        name: "Gerar PIX In (Deposito)",
        method: "POST" as const,
        path: "/api/external/pix/deposit",
        description:
          "Gera uma cobranca PIX para receber valores. Envie os dados do cliente (nome, CPF e email) junto com o valor desejado. O retorno inclui o QR Code e a chave copia-e-cola para o pagador efetuar a transferencia.\n\nO status da transacao pode ser acompanhado via webhook ou pelo endpoint de consulta de status.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
        formFields: [
          { key: "amount", label: "Valor (R$)", placeholder: "0.50", type: "number" },
          { key: "name", label: "Nome Completo", placeholder: "Penguim Pay service payment", type: "text", nested: "client" },
          { key: "document", label: "CPF", placeholder: "000.000.000-00", type: "text", nested: "client" },
          { key: "email", label: "E-mail", placeholder: "seuemail@penguimpay.com", type: "text", nested: "client" },
        ],
        body: JSON.stringify(
          {
            amount: 0.50,
            client: {
              name: "Penguim Pay service payment",
              document: "000.000.000-00",
              email: "seuemail@penguimpay.com",
            },
          },
          null,
          2
        ),
        codeExamples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl --location 'https://api.penguimpay.com/api/external/pix/deposit' \\
--header 'Authorization: Bearer SUA_PUBLIC_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "amount": 0.50,
    "client": {
      "name": "Penguim Pay service payment",
      "document": "000.000.000-00",
      "email": "seuemail@penguimpay.com"
    }
  }'`,
          },
          {
            language: "javascript",
            label: "JavaScript",
            code: `const response = await fetch('https://api.penguimpay.com/api/external/pix/deposit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SUA_PUBLIC_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 0.50,
    client: {
      name: 'Penguim Pay service payment',
      document: '000.000.000-00',
      email: 'seuemail@penguimpay.com'
    }
  })
});

const data = await response.json();
console.log(data);`,
          },
          {
            language: "node",
            label: "Node.js (Axios)",
            code: `const axios = require('axios');

const { data } = await axios.post(
  'https://api.penguimpay.com/api/external/pix/deposit',
  {
    amount: 0.50,
    client: {
      name: 'Penguim Pay service payment',
      document: '000.000.000-00',
      email: 'seuemail@penguimpay.com'
    }
  },
  {
    headers: {
      'Authorization': 'Bearer SUA_PUBLIC_KEY',
      'Content-Type': 'application/json'
    }
  }
);

console.log(data);`,
          },
          {
            language: "php",
            label: "PHP",
            code: `<?php

$ch = curl_init();

$payload = json_encode([
    'amount' => 0.50,
    'client' => [
        'name' => 'Penguim Pay service payment',
        'document' => '000.000.000-00',
        'email' => 'seuemail@penguimpay.com'
    ]
]);

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.penguimpay.com/api/external/pix/deposit',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer SUA_PUBLIC_KEY',
        'Content-Type: application/json'
    ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`,
          },
          {
            language: "csharp",
            label: "C#",
            code: `using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer SUA_PUBLIC_KEY");

var payload = new {
    amount = 0.50,
    client = new {
        name = "Penguim Pay service payment",
        document = "000.000.000-00",
        email = "seuemail@penguimpay.com"
    }
};

var content = new StringContent(
    JsonSerializer.Serialize(payload),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "https://api.penguimpay.com/api/external/pix/deposit",
    content
);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,
          },
        ],
      },
      {
        id: "tx-pix-out",
        name: "Gerar PIX Out (Saque)",
        method: "POST" as const,
        path: "/api/external/withdraw/pix",
        description:
          "Solicita um PIX Out (saque/envio de valores) do saldo disponivel. Informe o valor, a chave PIX de destino e o tipo da chave.\n\nTipos de chave PIX aceitos: CPF, CNPJ, EMAIL, PHONE, EVP (chave aleatoria).\n\nO saque sera processado e o status pode ser acompanhado via webhook.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
          { key: "Content-Type", value: "application/json" },
        ],
        formFields: [
          { key: "amount", label: "Valor (R$)", placeholder: "50.00", type: "number" },
          { key: "pix_key", label: "Chave PIX", placeholder: "11999999999", type: "text" },
          { key: "pix_key_type", label: "Tipo da Chave", placeholder: "PHONE", type: "text" },
        ],
        body: JSON.stringify(
          {
            amount: 50.00,
            pix_key: "11999999999",
            pix_key_type: "PHONE",
          },
          null,
          2
        ),
        codeExamples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl --location 'https://api.penguimpay.com/api/external/withdraw/pix' \\
--header 'Authorization: Bearer SUA_PUBLIC_KEY' \\
--header 'Content-Type: application/json' \\
--data '{
    "amount": 50.00,
    "pix_key": "11999999999",
    "pix_key_type": "PHONE"
  }'`,
          },
          {
            language: "javascript",
            label: "JavaScript",
            code: `const response = await fetch('https://api.penguimpay.com/api/external/withdraw/pix', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SUA_PUBLIC_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50.00,
    pix_key: '11999999999',
    pix_key_type: 'PHONE'
  })
});

const data = await response.json();
console.log(data);`,
          },
          {
            language: "node",
            label: "Node.js (Axios)",
            code: `const axios = require('axios');

const { data } = await axios.post(
  'https://api.penguimpay.com/api/external/withdraw/pix',
  {
    amount: 50.00,
    pix_key: '11999999999',
    pix_key_type: 'PHONE'
  },
  {
    headers: {
      'Authorization': 'Bearer SUA_PUBLIC_KEY',
      'Content-Type': 'application/json'
    }
  }
);

console.log(data);`,
          },
          {
            language: "php",
            label: "PHP",
            code: `<?php

$ch = curl_init();

$payload = json_encode([
    'amount' => 50.00,
    'pix_key' => '11999999999',
    'pix_key_type' => 'PHONE'
]);

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.penguimpay.com/api/external/withdraw/pix',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer SUA_PUBLIC_KEY',
        'Content-Type: application/json'
    ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`,
          },
          {
            language: "csharp",
            label: "C#",
            code: `using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer SUA_PUBLIC_KEY");

var payload = new {
    amount = 50.00,
    pix_key = "11999999999",
    pix_key_type = "PHONE"
};

var content = new StringContent(
    JsonSerializer.Serialize(payload),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "https://api.penguimpay.com/api/external/withdraw/pix",
    content
);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,
          },
        ],
      },
      {
        id: "tx-status",
        name: "Consultar Status",
        method: "GET" as const,
        path: "/api/external/pix/deposit/:transactionId",
        description:
          "Consulta o status de uma transacao PIX pelo ID da transacao. Retorna o estado atual (PENDING, APPROVED, EXPIRED, FAILED, REFUNDED) e os detalhes do pagamento.\n\nSubstitua :transactionId pelo ID recebido na criacao do PIX.",
        headers: [
          { key: "Authorization", value: "Bearer SUA_PUBLIC_KEY" },
        ],
        formFields: [
          { key: "transactionId", label: "Transaction ID", placeholder: "uuid-da-transacao", type: "text" },
        ],
        codeExamples: [
          {
            language: "curl",
            label: "cURL",
            code: `curl --location 'https://api.penguimpay.com/api/external/pix/deposit/SEU_TRANSACTION_ID' \\
--header 'Authorization: Bearer SUA_PUBLIC_KEY'`,
          },
          {
            language: "javascript",
            label: "JavaScript",
            code: `const transactionId = 'SEU_TRANSACTION_ID';

const response = await fetch(
  \`https://api.penguimpay.com/api/external/pix/deposit/\${transactionId}\`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer SUA_PUBLIC_KEY'
    }
  }
);

const data = await response.json();
console.log(data);`,
          },
          {
            language: "node",
            label: "Node.js (Axios)",
            code: `const axios = require('axios');

const transactionId = 'SEU_TRANSACTION_ID';

const { data } = await axios.get(
  \`https://api.penguimpay.com/api/external/pix/deposit/\${transactionId}\`,
  {
    headers: {
      'Authorization': 'Bearer SUA_PUBLIC_KEY'
    }
  }
);

console.log(data);`,
          },
          {
            language: "php",
            label: "PHP",
            code: `<?php

$transactionId = 'SEU_TRANSACTION_ID';

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.penguimpay.com/api/external/pix/deposit/{$transactionId}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer SUA_PUBLIC_KEY'
    ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`,
          },
          {
            language: "csharp",
            label: "C#",
            code: `using System.Net.Http;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer SUA_PUBLIC_KEY");

var transactionId = "SEU_TRANSACTION_ID";

var response = await client.GetAsync(
    $"https://api.penguimpay.com/api/external/pix/deposit/{transactionId}"
);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,
          },
        ],
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
          "A PenguimPay envia notificacoes automaticas para a URL configurada no seu webhook sempre que o status de uma transacao muda. O payload e enviado via POST com Content-Type application/json.\n\nVoce deve responder com status 200 para confirmar o recebimento. Caso contrario, a PenguimPay fara ate 3 tentativas de reenvio.\n\nExistem dois tipos de eventos principais: PAYMENT (quando um PIX In e confirmado) e WITHDRAWAL (quando um PIX Out e processado).",
        headers: [{ key: "Content-Type", value: "application/json" }],
        webhookPayloads: [
          {
            title: "Retorno de Pagamentos (PIX In)",
            payload: JSON.stringify(
              {
                event: "PAYMENT",
                timestamp: "2024-01-15T10:30:00.000Z",
                data: {
                  transactionId: "uuid-da-transacao",
                  externalId: "123456",
                  amount: 100.50,
                  status: "PAID_OUT",
                  paidAt: "2024-01-15T10:30:00.000Z",
                  paymentMethod: "PIX",
                  customer: {
                    name: "Joao Silva",
                    document: "123***789",
                  },
                  endToEnd: "E12345678901234567890",
                },
              },
              null,
              2
            ),
          },
          {
            title: "Retorno de Saques (PIX Out)",
            payload: JSON.stringify(
              {
                event: "WITHDRAWAL",
                timestamp: "2024-01-15T10:30:00.000Z",
                data: {
                  transactionId: "uuid-da-transacao",
                  externalId: "789012",
                  amount: 50.00,
                  status: "PAID_OUT",
                  processedAt: "2024-01-15T10:30:00.000Z",
                  pixKey: "11999999999",
                  endToEnd: "E98765432109876543210",
                },
              },
              null,
              2
            ),
          },
        ],
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
