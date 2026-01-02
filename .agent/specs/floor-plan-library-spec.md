# Floor Plan Library & Project Typology System
## Especificação Técnica - BrixAurea SaaS

**Versão:** 1.0  
**Data:** 2026-01-01  
**Autor:** Erik @ BrixAurea  

---

## 🎯 Objetivo

Transformar o sistema de "Mix de Unidades" em uma **Floor Plan Library** profissional com:
- Categorização hierárquica de projetos (Categoria → Subtipo)
- Biblioteca de plantas reutilizáveis com ficha técnica completa
- Métricas específicas por tipo de investimento
- Validação contextual de campos

---

## 📊 1. Estrutura de Categorias

### 1.1. Categorias Principais

```typescript
enum ProjectCategory {
  RESIDENTIAL_FOR_SALE = 'residential_for_sale',
  RESIDENTIAL_FOR_RENT = 'residential_for_rent', 
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  HOSPITALITY = 'hospitality',
  SPECIALTY = 'specialty'
}
```

### 1.2. Subtipos por Categoria

#### 🏘️ Residential – For Sale
```
- Townhomes
- Condos (Low-Rise)
- Condos (Mid-Rise)
- Condos (High-Rise)
- Single Family – Spec Homes
- Single Family – Build to Order
- Villas / Patio Homes
- Duplex
- Triplex
- Fourplex
- Planned Communities
- Master-Planned Community (MPC)
```
**Métricas-chave:** VGV, Absorção, $/sqft, Margem Bruta

---

#### 🏢 Multifamily – For Rent
```
- Garden Style Apartments
- Mid-Rise Multifamily
- High-Rise Multifamily
- Build-to-Rent (BTR) Communities
- Student Housing
- Senior Housing / 55+
- Co-Living
```
**Métricas-chave:** NOI, Cap Rate, DSCR, Exit Value, Rent/sqft

---

#### 🏬 Commercial
```
- Retail Strip Mall
- Standalone Retail (Pad-Ready)
- Office – Low Rise
- Medical Office Building (MOB)
- Warehouse / Industrial
- Flex Space
- Self-Storage
- Data Center
```
**Métricas-chave:** Lease Rate, Tenant Mix, Yield, CAM

---

#### 🌴 Hospitality / Short-Term
```
- Vacation Homes
- Short-Term Rental Communities
- Condo-Hotel
- Boutique Hotel
- Extended Stay
```
**Métricas-chave:** ADR, Occupancy %, RevPAR, NOI

---

#### 🏙️ Mixed-Use
```
- Residential + Retail
- Residential + Office
- Residential + Hotel
- Live-Work-Play Developments
- Transit-Oriented Developments (TOD)
```
**Métricas-chave:** Blended (por componente)

---

#### 🧓 Specialty / Nicho
```
- Affordable Housing
- Workforce Housing
- Senior Living
- Assisted Living
- Memory Care
- Mobile Home Park (MHP)
- RV Park
```
**Métricas-chave:** Subsídios, Tax Credits, Exit Cap Rate

---

## 🗄️ 2. Schema de Banco de Dados

### 2.1. Tabela: `property_categories`

```sql
CREATE TABLE property_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji ou icon name
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemplos de dados:**
```sql
INSERT INTO property_categories (key, name_en, name_pt, name_es, icon, sort_order) VALUES
('residential_for_sale', 'Residential – For Sale', 'Residencial – Para Venda', 'Residencial – En Venta', '🏘️', 1),
('residential_for_rent', 'Residential – For Rent', 'Residencial – Para Alugar', 'Residencial – En Alquiler', '🏢', 2),
('commercial', 'Commercial', 'Comercial', 'Comercial', '🏬', 3),
('mixed_use', 'Mixed Use', 'Uso Misto', 'Uso Mixto', '🏙️', 4),
('hospitality', 'Hospitality', 'Hospitalidade', 'Hospitalidad', '🌴', 5),
('specialty', 'Specialty / Niche', 'Especialidade / Nicho', 'Especialidad / Nicho', '🧓', 6);
```

---

### 2.2. Tabela: `property_subtypes`

```sql
CREATE TABLE property_subtypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES property_categories(id) ON DELETE CASCADE,
    key VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Características
    typical_income_level VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    typical_liquidity VARCHAR(20), -- 'very_low', 'low', 'medium', 'high', 'very_high'
    typical_complexity VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    
    -- Campos relevantes (JSON para flexibilidade)
    relevant_fields JSONB DEFAULT '{}', -- Ex: {"has_bedrooms": true, "has_hotel_metrics": false}
    
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, key)
);
```

**Exemplo de `relevant_fields` para diferentes subtipos:**

```json
// Townhomes (Residential - For Sale)
{
  "has_bedrooms": true,
  "has_bathrooms": true,
  "has_parking": true,
  "primary_metric": "vgv", // Gross Sales Value
  "sale_type": "for_sale",
  "unit_types": ["sqft_under_air", "sqft_outdoor", "total_sqft"]
}

// Garden Style Apartments (Multifamily - For Rent)
{
  "has_bedrooms": true,
  "has_bathrooms": true,
  "has_parking": true,
  "primary_metric": "noi", // Net Operating Income
  "sale_type": "for_rent",
  "has_cap_rate": true,
  "has_dscr": true,
  "unit_types": ["sqft_under_air", "rent_per_month"]
}

// Retail Strip Mall (Commercial)
{
  "has_bedrooms": false,
  "has_bathrooms": true, // Sim, banheiros comerciais
  "has_parking": true,
  "primary_metric": "lease_rate",
  "sale_type": "for_rent",
  "has_tenant_mix": true,
  "has_cam": true, // Common Area Maintenance
  "unit_types": ["sqft_leasable", "parking_spaces"]
}

// Condo-Hotel (Hospitality)
{
  "has_bedrooms": true,
  "has_bathrooms": true,
  "primary_metric": "revpar", // Revenue Per Available Room
  "sale_type": "mixed",
  "has_adr": true, // Average Daily Rate
  "has_occupancy": true,
  "unit_types": ["sqft_under_air", "keys"] // "keys" = número de unidades hoteleiras
}
```

---

### 2.3. Tabela: `floor_plan_library`

Biblioteca de plantas **reutilizáveis** criadas pelo usuário.

```sql
CREATE TABLE floor_plan_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID, -- Se tiver multi-tenancy
    
    -- Classificação
    subtype_id UUID REFERENCES property_subtypes(id),
    
    -- Identificação
    plan_name VARCHAR(100) NOT NULL, -- Ex: "The Madison", "Plan A1", "Retail Bay 2,500"
    plan_code VARCHAR(50), -- Ex: "MAD-001", "A1"
    
    -- Características Residenciais
    bedrooms DECIMAL(3,1), -- 3.0, 3.5 (den), etc
    bathrooms DECIMAL(3,1), -- 2.0, 2.5 (half bath)
    suites INTEGER DEFAULT 0,
    garages INTEGER DEFAULT 0,
    
    -- Áreas
    area_sqft DECIMAL(10,2), -- Área Under Air / Leasable
    area_outdoor DECIMAL(10,2), -- Balcony, Patio, Non-Conditioned
    area_total DECIMAL(10,2), -- Computed or explicit
    
    -- Custos Padronizados (Opcional)
    standard_cost_sqft DECIMAL(10,2), -- Custo de construção padrão
    standard_price_sqft DECIMAL(10,2), -- Preço de venda sugerido
    
    -- Características Comerciais / Hospitality (JSONB para flexibilidade)
    custom_attributes JSONB DEFAULT '{}', 
    -- Ex: {"parking_ratio": "3.5/1000", "ceiling_height": "14ft", "loading_docks": 2}
    
    -- Mídia
    floor_plan_image_url TEXT,
    rendering_url TEXT,
    
    -- Metadata
    notes TEXT,
    is_template BOOLEAN DEFAULT FALSE, -- Plantas que vêm como template do sistema
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_floor_plan_library_user ON floor_plan_library(user_id);
CREATE INDEX idx_floor_plan_library_subtype ON floor_plan_library(subtype_id);
```

---

### 2.4. Atualização: Tabela `units_mix`

Adicionar referência à biblioteca de plantas:

```sql
ALTER TABLE units_mix 
ADD COLUMN floor_plan_id UUID REFERENCES floor_plan_library(id);

ALTER TABLE units_mix
ADD COLUMN subtype_id UUID REFERENCES property_subtypes(id);

-- O model_name passa a ser opcional se floor_plan_id estiver preenchido
-- Podemos pegar o plan_name da biblioteca
```

**Lógica:**
- Se `floor_plan_id` está preenchido: puxar dados da biblioteca
- Se `floor_plan_id` está vazio: entrada manual (como é hoje)

---

## 🎨 3. Interface do Usuário

### 3.1. Configuração do Projeto (Overview Tab)

**Seletor em Cascata:**

```
┌─────────────────────────────────────────────┐
│ Tipo de Projeto                             │
│                                              │
│ Categoria Principal:                         │
│ ┌──────────────────────────────────────────┐│
│ │ 🏘️ Residencial – Para Venda            ▼││
│ └──────────────────────────────────────────┘│
│                                              │
│ Subtipo:                                     │
│ ┌──────────────────────────────────────────┐│
│ │ Townhomes                              ▼││
│ └──────────────────────────────────────────┘│
│                                              │
│ Características:                             │
│ • Renda: Média                               │
│ • Liquidez: Alta                             │
│ • Complexidade: Baixa                        │
│ • Métrica principal: VGV ($/sqft)           │
└─────────────────────────────────────────────┘
```

---

### 3.2. Tab de Unidades (Unit Mix)

**Opção 1: Usar Planta da Biblioteca**

```
┌────────────────────────────────────────────────────┐
│ Adicionar Unidade                                  │
│                                                    │
│ ○ Entrada Manual                                  │
│ ● Usar Planta da Biblioteca                       │
│                                                    │
│ ┌────────────────────────────────────────────────┐│
│ │ Selecione a Planta                           ▼││
│ │                                                ││
│ │ > The Madison (3 bed, 2.5 bath, 1,850 sqft)   ││
│ │   The Savannah (4 bed, 3 bath, 2,240 sqft)    ││
│ │   Plan A1 (2 bed, 2 bath, 1,200 sqft)         ││
│ │ + Criar Nova Planta                            ││
│ └────────────────────────────────────────────────┘│
│                                                    │
│ Quantidade:  [  5  ]                               │
│ Preço/sqft:  [ $350 ]                              │
│                                                    │
│ Preço Total: $3,237,500                            │
└────────────────────────────────────────────────────┘
```

**Ao selecionar uma planta, campos são preenchidos automaticamente:**
- Bedrooms, Bathrooms, Suites, Garages
- Area Sqft, Area Outdoor, Area Total
- Custo/sqft sugerido (se cadastrado)

**Opção 2: Entrada Manual**
- Funciona como hoje, mas com validação baseada no `subtype`

---

### 3.3. Gerenciamento da Biblioteca de Plantas

**Nova página: `/dashboard/floor-plans`**

```
┌─────────────────────────────────────────────────────┐
│ 📐 Biblioteca de Plantas                            │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🔍 Buscar plantas...              [+ Nova]     ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Filtros:                                            │
│ Categoria: [ Todos ▼]  Subtipo: [ Todos ▼]         │
│                                                     │
│ ┌───────┬────────────────┬──────┬──────┬─────────┐│
│ │ Img   │ Nome           │ Tipo │ Área │ Ações   ││
│ ├───────┼────────────────┼──────┼──────┼─────────┤│
│ │ [img] │ The Madison    │ TH   │1,850 │ ⚙ 📋 🗑 ││
│ │       │ 3bd, 2.5ba     │      │      │         ││
│ ├───────┼────────────────┼──────┼──────┼─────────┤│
│ │ [img] │ The Savannah   │ TH   │2,240 │ ⚙ 📋 🗑 ││
│ │       │ 4bd, 3ba       │      │      │         ││
│ ├───────┼────────────────┼──────┼──────┼─────────┤│
│ │ [img] │ Retail Bay A   │ Ret  │2,500 │ ⚙ 📋 🗑 ││
│ │       │ Corner Unit    │      │      │         ││
│ └───────┴────────────────┴──────┴──────┴─────────┘│
└─────────────────────────────────────────────────────┘

Ações:
⚙ = Editar
📋 = Duplicar
🗑 = Excluir
```

---

### 3.4. Formulário de Cadastro de Planta

```
┌──────────────────────────────────────────────────────┐
│ Nova Planta                                          │
│                                                      │
│ Categoria: 🏘️ Residencial – Para Venda              │
│ Subtipo:   Townhomes                                 │
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Identificação                                    ││
│ │                                                  ││
│ │ Nome da Planta:  [ The Madison              ]   ││
│ │ Código (Opc):    [ MAD-001                  ]   ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Características                                  ││
│ │                                                  ││
│ │ Quartos:    [ 3   ]    Suítes:  [ 1   ]         ││
│ │ Banheiros:  [ 2.5 ]    Vagas:   [ 2   ]         ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Áreas (sqft)                                     ││
│ │                                                  ││
│ │ Under Air:        [ 1,650 ]                      ││
│ │ Outdoor (Patio):  [   200 ]                      ││
│ │ Total:            [ 1,850 ] (auto-calc)          ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Custos Padrão (Opcional)                         ││
│ │                                                  ││
│ │ Custo/sqft:   [ $180 ]                           ││
│ │ Preço/sqft:   [ $350 ]                           ││
│ │                                                  ││
│ │ Margem sugerida: 94% 📊                          ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ Imagens                                          ││
│ │                                                  ││
│ │ Floor Plan:  [ Escolher arquivo... ]             ││
│ │ Rendering:   [ Escolher arquivo... ]             ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ Observações:                                         │
│ ┌────────────────────────────────────────────────┐ │
│ │ End unit with premium finishes...              │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Cancelar]                           [Salvar Planta]│
└──────────────────────────────────────────────────────┘
```

---

## 🔄 4. Fluxo de Trabalho

### 4.1. Fluxo: Criar Projeto com Plantas da Biblioteca

```
1. Overview Tab: Selecionar Categoria e Subtipo
   └─> Sistema define campos relevantes

2. Units Tab: Clicar "Adicionar Unidade"
   └─> Escolher "Usar Planta da Biblioteca"
   └─> Selecionar "The Madison"
   └─> Campos preenchidos automaticamente
   └─> Ajustar preço/sqft se necessário
   └─> Definir quantidade
   └─> Salvar

3. Sistema calcula GDV baseado em:
   - Quantidade × Área × Preço/sqft
```

### 4.2. Fluxo: Criar Nova Planta Durante Cadastro

```
1. Units Tab: Clicar "Adicionar Unidade"
2. Escolher "Usar Planta da Biblioteca"
3. Clicar "+ Criar Nova Planta"
4. Modal abre com formulário
5. Preencher ficha técnica
6. Salvar
7. Planta disponível imediatamente no dropdown
8. Selecionar e usar
```

---

## 📊 5. Métricas Específicas por Categoria

### 5.1. Residential – For Sale
**Campos no Financial Tab:**
- Gross Sales Value (GDV / VGV)
- Absorption Rate (units/month)
- Average Price per Sqft
- Gross Margin %

### 5.2. Residential – For Rent (Multifamily)
**Campos adicionais:**
- Monthly Rent per Unit
- Gross Potential Rent (GPR)
- Vacancy & Collection Loss
- Net Operating Income (NOI)
- Exit Cap Rate
- Exit Value
- DSCR (Debt Service Coverage Ratio)

### 5.3. Commercial
**Campos adicionais:**
- Lease Rate ($/sqft/year)
- Tenant Mix (% by category)
- CAM (Common Area Maintenance)
- Triple Net (NNN) vs Gross Lease
- Valuation Yield

### 5.4. Hospitality
**Campos adicionais:**
- ADR (Average Daily Rate)
- Occupancy %
- RevPAR (Revenue Per Available Room)
- NOI
- Exit Cap Rate

---

## ⚙️ 6. Validações Contextuais

### 6.1. Campos Obrigatórios por Subtype

```typescript
// Exemplo de validação
if (project.subtype.relevant_fields.has_bedrooms) {
  // Campo "Quartos" é obrigatório
}

if (project.subtype.relevant_fields.has_hotel_metrics) {
  // Campos ADR, Occupancy são obrigatórios
}

if (!project.subtype.relevant_fields.has_bedrooms) {
  // Esconder campo "Quartos" completamente
}
```

### 6.2. Labels Dinâmicos

```typescript
// Se for Commercial
areaLabel = "Leasable Sqft"

// Se for Residential
areaLabel = "Sqft Under Air"

// Se for Hospitality
areaLabel = "Sqft per Key"
```

---

## 🚀 7. Roadmap de Implementação

### Fase 1: Database & Backend (Semana 1)
- [ ] Criar tabelas `property_categories`
- [ ] Criar tabelas `property_subtypes`
- [ ] Criar tabela `floor_plan_library`
- [ ] Popular dados seed (categorias e subtipos)
- [ ] Migrations e RLS policies
- [ ] API endpoints para CRUD de floor plans

### Fase 2: Floor Plan Library UI (Semana 2)
- [ ] Página `/dashboard/floor-plans`
- [ ] CRUD de plantas
- [ ] Upload de imagens (floor plan, render)
- [ ] Filtros e busca

### Fase 3: Project Configuration (Semana 3)
- [ ] Seletor em cascata (Categoria → Subtipo)
- [ ] Atualizar Overview Tab
- [ ] Mostrar características do subtipo
- [ ] Validações contextuais

### Fase 4: Units Tab Integration (Semana 4)
- [ ] Seletor "Manual vs Biblioteca"
- [ ] Dropdown de plantas filtrado por subtipo
- [ ] Auto-preenchimento de campos
- [ ] Opção de criar planta inline

### Fase 5: Métricas Específicas (Semana 5-6)
- [ ] Financial Tab: campos condicionais
- [ ] Cálculos específicos (NOI, Cap Rate, RevPAR, etc)
- [ ] Relatórios adaptados por categoria

### Fase 6: Polish & Templates (Semana 7)
- [ ] Plantas template por subtipo
- [ ] Biblioteca de plantas públicas (inspiração)
- [ ] Onboarding: sugerir plantas baseado no tipo
- [ ] Analytics: plantas mais usadas

---

## 📋 8. Dados Seed: Subtipos Detalhados

### Residential – For Sale

```sql
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields) VALUES
(
  (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
  'townhomes',
  'Townhomes',
  'Townhomes',
  'Adosados',
  'medium',
  'high',
  'low',
  '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb
),
(
  (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
  'condos_low_rise',
  'Condos (Low-Rise)',
  'Condos (Baixo)',
  'Condos (Baja Altura)',
  'medium',
  'high',
  'medium',
  '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_hoa": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb
),
(
  (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
  'single_family_spec',
  'Single Family – Spec Homes',
  'Casa Unifamiliar – Spec',
  'Casa Unifamiliar – Spec',
  'medium',
  'very_high',
  'low',
  '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_lot_size": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb
);

-- (Continuar para todos os subtipos...)
```

---

## 🎯 9. Benefícios do Sistema

### Para o Desenvolvedor/Incorporador:
✅ **Reutilização**: Uma vez cadastrada, a planta "The Madison" pode ser usada em 10 projetos diferentes  
✅ **Velocidade**: Criar viabilidades 5x mais rápido  
✅ **Padronização**: Custos e preços consistentes  
✅ **Profissionalismo**: Apresentações com plantas visuais  

### Para o Banco/Investidor:
✅ **Clareza**: Sabe exatamente o produto que está sendo vendido  
✅ **Comparabilidade**: "Ah, é um projeto de Townhomes. Cap Rate esperado 6-7%."  
✅ **Confiança**: Sistema estruturado = análise mais rápida  

### Para o BrixAurea:
✅ **Diferenciação**: Nenhum concorrente tem isso  
✅ **Escalabilidade**: Biblioteca de templates própria  
✅ **Network Effect**: Usuários compartilham plantas (futuro marketplace?)  
✅ **Upsell**: "Pro Plan" com biblioteca premium  

---

## ❓ 10. Perguntas para Próximos Passos

1. **Prioridade**: Implementar tudo ou fazer MVP incremental?
2. **Templates**: Você quer que eu crie uma biblioteca inicial de plantas exemplo?
3. **Público vs Privado**: Plantas são sempre privadas ou podem ter uma galeria pública?
4. **Compartilhamento**: Empresas podem compartilhar plantas entre membros do time?
5. **Versionamento**: Se alguém editar uma planta usada em 5 projetos, atualiza retroativo ou cria nova versão?

---

**Próximo passo:** Aguardando seu feedback para iniciarmos a implementação! 🚀
