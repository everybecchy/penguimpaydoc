import { Shield, ArrowLeftRight, Bell, Lock } from "lucide-react"

export function DocWelcome() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logotipo%20Design%20%285%29-t3S2Z5N6XGgW6o3oU6VuONDsWAX3hP.png"
              alt="PenguimPay Logo"
              className="h-16 w-16 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-card-foreground text-balance">
                PenguimPay API
              </h1>
              <p className="text-muted-foreground text-sm">
                v1.0 - Plataforma de Pagamentos
              </p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            Bem-vindo a documentacao da API PenguimPay.
            Aqui voce encontra os endpoints para gerar PIX In (depositos),
            PIX Out (saques), consultar status, gerenciar compliance e configurar webhooks.
            Insira sua publickey no campo Bearer Token na sidebar para testar os endpoints diretamente.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
          <div className="rounded-lg bg-accent/10 p-2.5 h-fit">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm mb-1">
              Authentication
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use sua publickey diretamente como Bearer Token em todas as chamadas. Sem necessidade de login ou JWT.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 h-fit">
            <ArrowLeftRight className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm mb-1">
              Transactions
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gere PIX In (deposito), PIX Out (saque), consulte status de transacoes e gerencie compliance.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
          <div className="rounded-lg bg-sky-500/10 p-2.5 h-fit">
            <Bell className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm mb-1">
              Webhooks
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Receba notificacoes automaticas sobre mudancas de status
              das transacoes na URL configurada.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
          <div className="rounded-lg bg-amber-500/10 p-2.5 h-fit">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm mb-1">
              Base URL
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todas as chamadas utilizam{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono text-card-foreground">
                https://api.penguimpay.com
              </code>{" "}
              como base.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Auth Guide */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-card-foreground text-sm mb-3">
          Como comecar
        </h3>
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div className="flex gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-xs h-6 w-6 shrink-0">
              1
            </span>
            <p>
              Obtenha sua <strong className="text-card-foreground">publickey</strong> no painel da PenguimPay ao criar sua conta de integrador.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-xs h-6 w-6 shrink-0">
              2
            </span>
            <p>
              Insira a publickey no campo <strong className="text-card-foreground">Bearer Token</strong> na sidebar esquerda. Ela sera usada automaticamente em todas as requests.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-xs h-6 w-6 shrink-0">
              3
            </span>
            <p>
              Selecione um endpoint na sidebar, copie os exemplos de codigo na sua linguagem ou clique em <strong className="text-card-foreground">&quot;Enviar Request&quot;</strong> para testar diretamente.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Header Example */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-card-foreground text-sm mb-3">
          Header de Autenticacao
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Todas as requisicoes devem incluir o seguinte header com sua publickey:
        </p>
        <pre className="rounded-lg bg-[hsl(213,60%,10%)] p-4 text-xs font-mono text-[hsl(210,20%,80%)] overflow-x-auto">
{`Authorization: Bearer pk_sua_chave_aqui
Content-Type: application/json`}
        </pre>
      </div>

      {/* Status Codes */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-card-foreground text-sm mb-3">
          Codigos de Status HTTP
        </h3>
        <div className="space-y-2">
          {[
            { code: "200", label: "OK", desc: "Requisicao bem-sucedida", color: "text-emerald-600 bg-emerald-500/10" },
            { code: "201", label: "Created", desc: "Recurso criado com sucesso", color: "text-emerald-600 bg-emerald-500/10" },
            { code: "400", label: "Bad Request", desc: "Dados invalidos na requisicao", color: "text-amber-600 bg-amber-500/10" },
            { code: "401", label: "Unauthorized", desc: "Token ausente ou invalido", color: "text-red-600 bg-red-500/10" },
            { code: "403", label: "Forbidden", desc: "Sem permissao para acessar o recurso", color: "text-red-600 bg-red-500/10" },
            { code: "404", label: "Not Found", desc: "Recurso nao encontrado", color: "text-amber-600 bg-amber-500/10" },
            { code: "500", label: "Internal Error", desc: "Erro interno do servidor", color: "text-red-600 bg-red-500/10" },
          ].map((status) => (
            <div key={status.code} className="flex items-center gap-3 text-xs">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono font-bold ${status.color}`}
              >
                {status.code}
              </span>
              <span className="font-medium text-card-foreground w-28 shrink-0">
                {status.label}
              </span>
              <span className="text-muted-foreground">{status.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
