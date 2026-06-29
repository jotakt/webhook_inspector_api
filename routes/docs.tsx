import { define } from "@/utils.ts";
import type { ComponentChildren } from "preact";

const baseChannel = "demo1234";

const menu = [
  { href: "#introducao", label: "Introdução" },
  { href: "#convencoes", label: "Convenções" },
  { href: "#endpoints", label: "Endpoints" },
  { href: "#webhook", label: "Receber webhook" },
  { href: "#events", label: "Eventos em tempo real" },
  { href: "#status", label: "Status codes" },
  { href: "#objeto", label: "Objeto WebhookLog" },
  { href: "#limites", label: "Limites" },
  { href: "#roadmap", label: "O que vem aí" },
];

export default define.page((ctx) => {
  const origin = new URL("/", ctx.url).origin;
  const newChannel = crypto.randomUUID().slice(0, 8);

  return (
    <main class="api-docs-page">
      <header class="api-docs-topbar">
        <a href="/" class="api-docs-back">← Início</a>

        <nav class="api-docs-topnav">
          <a href="/docs">Docs</a>
          <a href={`/inspect/${newChannel}`} class="api-docs-cta">
            Criar inspector
          </a>
        </nav>
      </header>

      <div class="api-docs-shell">
        <aside class="api-docs-sidebar">
          <div class="api-docs-sidebar-inner">
            <p class="api-docs-sidebar-title">API Reference</p>

            <nav>
              {menu.map((item) => (
                <a href={item.href} class="api-docs-sidebar-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article class="api-docs-content">
          <section class="api-docs-hero">
            <div class="api-docs-icon">🔗</div>
            <h1>API Reference</h1>
            <p>
              Referência da API do Webhook Inspector. Use esta documentação para
              receber, registrar e inspecionar webhooks HTTP em tempo real
              durante o desenvolvimento de integrações.
            </p>
          </section>

          <MobileIndex />

          <DocSection id="introducao" eyebrow="Generic" title="Introdução">
            <p>
              O Webhook Inspector gera uma URL temporária para receber
              requisições HTTP externas. Cada requisição recebida é registrada e
              aparece no painel visual do canal correspondente.
            </p>

            <Callout>
              Esta API é pensada para ambiente de desenvolvimento, depuração de
              webhooks e validação de payloads antes da implementação final no
              backend da aplicação.
            </Callout>

            <p>
              A aplicação usa Fresh, Deno KV com expiração automática e
              Server-Sent Events para atualizar o painel em tempo real.
            </p>
          </DocSection>

          <DocSection id="convencoes" title="Convenções">
            <h3>Base URL</h3>

            <p>
              Durante o desenvolvimento local, a base URL padrão é:
            </p>

            <CodeBlock value={origin} />

            <h3>Formato dos dados</h3>

            <ul>
              <li>Requests e responses usam JSON quando aplicável.</li>
              <li>Datas são retornadas em ISO 8601.</li>
              <li>O corpo original da requisição é preservado como texto.</li>
              <li>
                Quando o <InlineCode>content-type</InlineCode> é{" "}
                <InlineCode>application/json</InlineCode>, o body também é
                disponibilizado como JSON parseado.
              </li>
            </ul>
          </DocSection>

          <DocSection id="endpoints" title="Endpoints">
            <EndpointTable />
          </DocSection>

          <DocSection id="webhook" title="Receber webhook">
            <EndpointHeader
              method="POST"
              path="/api/hooks/:channel"
              description="Recebe e registra uma requisição HTTP no canal informado."
            />

            <h3>Path parameters</h3>

            <DataTable
              columns={["Parâmetro", "Tipo", "Descrição"]}
              rows={[
                [
                  <InlineCode>channel</InlineCode>,
                  "string",
                  "Identificador do canal que receberá o webhook.",
                ],
              ]}
            />

            <h3>Exemplo</h3>

            <CodeBlock
              value={`curl.exe -X POST "${origin}/api/hooks/${baseChannel}" -H "content-type: application/json" -d '{"event":"payment.succeeded","amount":14990}'`}
            />

            <h3>Resposta</h3>

            <CodeBlock
              value={`{
  "ok": true,
  "saved": true,
  "source": "file-route",
  "channel": "${baseChannel}",
  "id": "b5ba5299-1675-4093-b31d-7159377d06b2",
  "method": "POST",
  "receivedAt": "2026-06-29T21:44:22.000Z"
}`}
            />
          </DocSection>

          <DocSection id="events" title="Eventos em tempo real">
            <EndpointHeader
              method="GET"
              path="/api/events/:channel"
              description="Abre uma conexão Server-Sent Events para receber novos webhooks em tempo real."
            />

            <p>
              Este endpoint mantém uma conexão aberta. Quando um novo webhook é
              salvo no canal, o servidor envia um evento{" "}
              <InlineCode>webhook</InlineCode> para o cliente.
            </p>

            <h3>Exemplo</h3>

            <CodeBlock
              value={`curl.exe -N "${origin}/api/events/${baseChannel}"`}
            />

            <h3>Evento conectado</h3>

            <CodeBlock
              value={`event: connected
data: {"channel":"${baseChannel}","connectedAt":"2026-06-29T21:43:11.540Z"}`}
            />

            <h3>Evento webhook</h3>

            <CodeBlock
              value={`event: webhook
data: {"id":"...","channel":"${baseChannel}","method":"POST","bodyJson":{"event":"payment.succeeded"}}`}
            />
          </DocSection>

          <DocSection id="status" title="Status codes">
            <DataTable
              columns={["Status", "Código", "Descrição"]}
              rows={[
                ["202", "accepted", "Webhook recebido e registrado."],
                ["204", "no_content", "Resposta para requisições OPTIONS."],
                ["405", "method_not_allowed", "Método HTTP não suportado."],
                ["500", "internal_error", "Erro interno ao processar a requisição."],
              ]}
            />
          </DocSection>

          <DocSection id="objeto" title="Objeto WebhookLog">
            <p>
              Cada webhook recebido é armazenado temporariamente com a seguinte
              estrutura:
            </p>

            <DataTable
              columns={["Campo", "Tipo", "Descrição"]}
              rows={[
                ["id", "string", "Identificador único do log."],
                ["channel", "string", "Canal que recebeu o webhook."],
                ["method", "string", "Método HTTP usado na requisição."],
                ["url", "string", "URL completa recebida pelo servidor."],
                ["path", "string", "Path da requisição."],
                ["query", "object", "Query params convertidos em objeto."],
                ["headers", "object", "Headers recebidos."],
                ["bodyText", "string", "Corpo bruto da requisição."],
                ["bodyJson", "object | null", "Body parseado quando for JSON válido."],
                ["contentType", "string | null", "Valor do header content-type."],
                ["receivedAt", "string", "Data/hora de recebimento em ISO 8601."],
                ["sizeBytes", "number", "Tamanho aproximado do body em bytes."],
                ["remoteAddr", "string | null", "IP/origem quando disponível."],
              ]}
            />

            <h3>Exemplo</h3>

            <CodeBlock
              value={`{
  "id": "b5ba5299-1675-4093-b31d-7159377d06b2",
  "channel": "${baseChannel}",
  "method": "POST",
  "headers": {
    "content-type": "application/json"
  },
  "bodyText": "{\\"event\\":\\"payment.succeeded\\"}",
  "bodyJson": {
    "event": "payment.succeeded"
  },
  "receivedAt": "2026-06-29T21:44:22.000Z"
}`}
            />
          </DocSection>

          <DocSection id="limites" title="Limites">
            <DataTable
              columns={["Recurso", "Limite atual"]}
              rows={[
                ["Retenção dos logs", "24 horas"],
                ["Autenticação", "Não disponível no V1"],
                ["Rate limit por canal", "Não disponível no V1"],
                ["Relay para outro endpoint", "Não disponível no V1"],
                ["Persistência permanente", "Não disponível no V1"],
              ]}
            />
          </DocSection>

          <DocSection id="roadmap" title="O que vem aí">
            <ul>
              <li>Autenticação por token nos canais.</li>
              <li>Botão para copiar URL do webhook.</li>
              <li>Limpeza manual dos registros do canal.</li>
              <li>Relay para encaminhar webhooks para outro backend.</li>
              <li>Rate limit básico por canal.</li>
              <li>Filtro por método HTTP, header ou conteúdo do body.</li>
            </ul>
          </DocSection>
        </article>
      </div>
    </main>
  );
});

function MobileIndex() {
  return (
    <details class="api-docs-mobile-index">
      <summary>Índice</summary>

      <nav>
        {menu.map((item) => (
          <a href={item.href}>{item.label}</a>
        ))}
      </nav>
    </details>
  );
}

function DocSection(
  { id, eyebrow, title, children }: {
    id: string;
    eyebrow?: string;
    title: string;
    children: ComponentChildren;
  },
) {
  return (
    <section id={id} class="api-docs-section">
      {eyebrow && <p class="api-docs-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <div class="api-docs-section-body">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: ComponentChildren }) {
  return (
    <div class="api-docs-callout">
      <span>❗</span>
      <p>{children}</p>
    </div>
  );
}

function EndpointHeader(
  { method, path, description }: {
    method: string;
    path: string;
    description: string;
  },
) {
  return (
    <div class="api-docs-endpoint-header">
      <div>
        <span class="api-docs-method">{method}</span>
        <code>{path}</code>
      </div>
      <p>{description}</p>
    </div>
  );
}

function EndpointTable() {
  return (
    <DataTable
      columns={["Método", "Endpoint", "Descrição"]}
      rows={[
        [
          <Method>GET</Method>,
          <InlineCode>/inspect/:channel</InlineCode>,
          "Abre o painel visual do canal.",
        ],
        [
          <Method>POST</Method>,
          <InlineCode>/api/hooks/:channel</InlineCode>,
          "Recebe e registra um webhook.",
        ],
        [
          <Method>PUT</Method>,
          <InlineCode>/api/hooks/:channel</InlineCode>,
          "Recebe e registra uma requisição PUT.",
        ],
        [
          <Method>PATCH</Method>,
          <InlineCode>/api/hooks/:channel</InlineCode>,
          "Recebe e registra uma requisição PATCH.",
        ],
        [
          <Method>DELETE</Method>,
          <InlineCode>/api/hooks/:channel</InlineCode>,
          "Recebe e registra uma requisição DELETE.",
        ],
        [
          <Method>GET</Method>,
          <InlineCode>/api/events/:channel</InlineCode>,
          "Abre stream SSE para atualização em tempo real.",
        ],
      ]}
    />
  );
}

function DataTable(
  { columns, rows }: {
    columns: ComponentChildren[];
    rows: ComponentChildren[][];
  },
) {
  return (
    <div class="api-docs-table-wrap">
      <table class="api-docs-table">
        <thead>
          <tr>
            {columns.map((column) => <th>{column}</th>)}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr>
              {row.map((cell) => <td>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre class="api-docs-code">
      <code>{value}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: ComponentChildren }) {
  return <code class="api-docs-inline-code">{children}</code>;
}

function Method({ children }: { children: ComponentChildren }) {
  return <span class="api-docs-method">{children}</span>;
}