# BrixAurea Backlog - Tarefas Pendentes

## UI/UX & Visual
- [x] **Bandeiras de Estado nos Cartões de Projeto**: Implementado usando FlagCDN e corrigido erro de CSP (Content Security Policy) no `next.config.ts`. Adicionado contexto de endereço na aba Regional.

## Database & Backend
- [x] **Configuração de Cron no Supabase**: Migração `19_enable_cron.sql` executada com sucesso. Limpeza automática da lixeira agendada para meia-noite.

## Deployment
- [ ] Monitorar logs de produção após o deploy das novas animações do Framer Motion.

## Segurança e Infraestrutura (Fase Comercial)
- [ ] **Migração Cloudflare**: Mover DNS para Cloudflare quando o projeto for comercial.
  - Configurar WAF.
  - Ativar Rate Limiting Global.
  - Ativar Modo Full (Strict) SSL.
