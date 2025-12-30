# STRIPE WEBHOOK SETUP - Execute Este Script
# ==================================================

Write-Host "=== STRIPE WEBHOOK LISTENER SETUP ===" -ForegroundColor Cyan
Write-Host ""

# Tentar encontrar Stripe CLI
$stripePath = Get-Command stripe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source

if (-not $stripePath) {
    Write-Host "Stripe CLI encontrado em: $stripePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "FECHE ESTE TERMINAL E ABRA UM NOVO POWERSHELL!" -ForegroundColor Red
    Write-Host "Depois execute novamente este script." -ForegroundColor Red
    exit 1
}

Write-Host "Stripe CLI encontrado!" -ForegroundColor Green
Write-Host ""

# Passo 1: Login
Write-Host "PASSO 1: Login no Stripe" -ForegroundColor Cyan
Write-Host "Isso vai abrir seu navegador. Faça login no Stripe Dashboard." -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione ENTER para continuar"

& $stripePath login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no login. Tente novamente." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Login realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 2: Iniciar Listener
Write-Host "PASSO 2: Iniciando Webhook Listener" -ForegroundColor Cyan
Write-Host ""
Write-Host "O webhook secret será exibido abaixo." -ForegroundColor Yellow
Write-Host "COPIE tudo que começar com 'whsec_'" -ForegroundColor Yellow
Write-Host "Depois adicione ao .env.local como STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Yellow
Write-Host ""
Write-Host "ATENÇÃO: Este terminal ficará 'travado' rodando o listener." -ForegroundColor Red
Write-Host "NÃO FECHE! Deixe rodando enquanto testa os webhooks." -ForegroundColor Red
Write-Host ""
Write-Host "Para parar: Pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando em 3 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

& $stripePath listen --forward-to http://localhost:3000/api/stripe/webhook
