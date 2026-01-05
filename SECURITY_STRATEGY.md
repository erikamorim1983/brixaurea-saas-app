# Estratégia de Segurança Atualizada - BrixAurea SaaS

Este documento detalha a postura de segurança atual da aplicação e recomendações para melhorias, alinhadas com as solicitações recentes.

## 1. Hospedagem e Proteção de Borda (Hostinger -> Cloudflare)
**Recomendação: MIGRAR PARA CLOUDFLARE**

Atualmente na Hostinger, a aplicação se beneficia de migrar o DNS e a proteção de borda para a Cloudflare.
**Benefícios:**
- **WAF (Web Application Firewall):** Bloqueia ataques comuns (SQL Injection, XSS) antes que cheguem ao servidor.
- **Proteção DDoS:** Mitigação robusta contra ataques de negação de serviço.
- **Rate Limiting Global:** Protege contra brute-force na camada de rede, complementando o rate limiting da aplicação.
- **SSL/TLS Automático:** Criptografia ponta a ponta.

**Ação:** Configurar os nameservers do domínio na Cloudflare e ativar o modo "Full (Strict)" de SSL.

## 2. Criptografia de Senhas (Argon2id vs. Bcrypt)
**Estado Atual:** Supabase Auth (Bcrypt).
**Análise:**
- A aplicação utiliza **Supabase Auth**, que gerencia a segurança das credenciais internamente usando **Bcrypt**.
- **Argon2id** é de fato o algoritmo mais moderno (vencedor do PHC), sendo superior em resistência a ataques baseados em GPU/ASIC devido ao uso intensivo de memória.
- **Conclusão:** Como utilizamos o serviço gerenciado do Supabase, não podemos alterar o algoritmo interno sem refazer todo o sistema de autenticação (Self-hosted). O Bcrypt continua sendo extremamente seguro e padrão da indústria.
- **Recomendação:** Manter o Supabase Auth. A segurança oferecida pelo serviço gerenciado supera o risco de implementar uma solução caseira apenas para trocar o algoritmo.

## 3. Cookies e HttpOnly
**Estado Atual:** Implementado.
**Detalhes:**
- A aplicação utiliza `@supabase/ssr` para gerenciar sessões.
- O token de acesso (access_token) é armazenado e transmitido via Cookies com a flag `HttpOnly` ativa por padrão nas interações com o backend.
- Isso impede que scripts maliciosos no navegador (XSS) leiam o token de sessão.

## 4. Proteção contra SQL Injection
**Estado Atual:** Protegido por Design.
**Detalhes:**
- **Frontend (Next.js):** Utiliza o cliente Supabase (PostgREST), que utiliza consultas parametrizadas automaticamente. Não há concatenação de strings SQL.
- **Backend (Python):** Utiliza `SQLModel` e `SQLAlchemy`, que também sanitizam inputs automaticamente.
- **Auditoria:** O código de log de auditoria (`audit-logger.ts`) utiliza inserções seguras via cliente Supabase.

## 5. Proteção contra XSS e CSRF
**Estado Atual:** Protegido.
**Detalhes:**
- **XSS:** Next.js escapa automaticamente o conteúdo renderizado. Cabeçalhos de segurança (`Content-Security-Policy`, `X-XSS-Protection`) estão configurados no `next.config.ts`.
- **CSRF:** O fluxo de autenticação do Supabase utiliza cookies `SameSite=Lax` ou `Strict`, prevenindo ataques de falsificação de solicitação entre sites.
- **Headers:** `X-Frame-Options: DENY` previne Clickjacking.

## 6. Auditoria e Logs (Audit Logs) & Rate Limiting
**Estado Atual:** Implementado e Ativo.
**Detalhes:**
- **Logs:** O arquivo `lib/security/audit-logger.ts` já implementa um sistema robusto de logs que registra:
  - Tipo de evento (login, falha, alteração de senha).
  - Hash do IP e User Agent (para privacidade e rastreio).
  - Severidade do evento.
- **Rate Limiting (Aplicação):**
  - O endpoint de login (`api/auth/login/route.ts`) possui rate limiting ativo (`checkRateLimit`), bloqueando tentativas excessivas.
  - O Backend Python (`main.py`) utiliza `slowapi` para limitar requisições.
- **Melhoria:** A adição da Cloudflare adicionará uma camada *extra* de rate limiting antes mesmo da requisição tocar nossa API.
