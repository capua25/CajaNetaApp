# Caja Neta — Mini SaaS

## Idea principal
**Caja Neta** es una app simple que ayuda a emprendedores y pequeños negocios a saber si realmente están ganando o perdiendo plata.

### Convierte números confusos en respuestas claras:
- ¿Estoy ganando?
- ¿Cuánto gano?
- ¿Qué precio debería cobrar?

---

## Problema que resuelve
La mayoría de los pequeños negocios:
- ponen precios “a ojo”
- no calculan costos reales
- no saben su margen
- mezclan gastos personales y del negocio

### Resultado: pierden plata sin darse cuenta

---

## Solución
Una **calculadora simple e inteligente** que:

- calcula ganancia por producto
- muestra margen (%)
- detecta si estás perdiendo dinero
- sugiere el precio ideal

---

## Funcionalidades (MVP)

### Inputs:
- costo del producto
- gastos adicionales
- precio de venta
- margen deseado

### Outputs:
- ganancia por unidad
- margen (%)
- estado (ganancia / riesgo / pérdida)
- precio recomendado

---

## Diferencial clave
### “Te dice la verdad en segundos”

- sin contabilidad compleja
- sin dashboards innecesarios
- directo al punto: dinero

---

## Cliente ideal
- emprendedores de Instagram
- repostería / comida casera
- tiendas de ropa
- pequeños comercios

---

## Modelo de negocio

### Freemium:
- 1 producto gratis

### Pro (UYU 450 por mes):
- productos ilimitados
- simulador de precios
- insights automáticos

---

## Go-To-Market
- ventas directas por Instagram y WhatsApp  
- enfoque en nichos específicos  
- mensaje claro:  
### “¿Sabés si estás ganando plata?”  

---

## Propuesta de valor

> “Calculá tu ganancia real y poné precios correctos en segundos”

---

## Insight clave
La gente no compra “finanzas”.

### Compra:
**no perder plata**

---

## Escalabilidad
- expansión a LATAM  
- agregar stock, ventas, reportes  
- integraciones con pagos  

---

## Tagline
### “Dejá de adivinar tus precios”

---------------------------------------------------------------------------------------------------

# Caja Neta — Full SaaS Development Specification

## 1. Overview

Caja Neta is a simple SaaS that helps small businesses understand if they are making or losing money per product.

A simple profit calculator that:

- Calculates profit per product  
- Shows margin (%)  
- Detects losses  
- Suggests optimal price  

---

## Architecture

### Stack

- Frontend: Next.js (App Router)
- Backend: Next.js API Routes (monolith)
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- Payments: Mercado Pago (Subscriptions - Preapproval)
- Hosting: Vercel

---

### High-Level Architecture

[ User ]
↓
[ Next.js App ]
↓
[ API Routes ]
↓
[ Supabase (Postgres + Auth) ]
↓
[ Mercado Pago API ]

---

## Database Schema

### Users

```sql
id UUID PRIMARY KEY
email TEXT
plan TEXT DEFAULT 'free'
mp_subscription_id TEXT
plan_status TEXT DEFAULT 'free'
created_at TIMESTAMP DEFAULT NOW()
```

### Products

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
name TEXT
cost NUMERIC
expenses NUMERIC
price NUMERIC
margin NUMERIC
created_at TIMESTAMP DEFAULT NOW()
```

## Business Logic

### Total Cost
cost_total = cost + expenses

### Profit
profit = price - cost_total

### Margin
margin = profit / price

### Suggested Price
suggested_price = cost_total / (1 - desired_margin)

## Status Logic

if margin >= 0.3 → "success"
if margin >= 0.1 → "warning"
if margin < 0.1 → "danger"

## Core Features

### Free Plan

- Create 1 product
- Calculate:
    - profit
    - margin
    - status

### Pro Plan

- Unlimited products
- Price simulator (slider)
- Insights (alerts)

## API Endpoints

### Products

POST /api/products
Create product

GET /api/products
Get all user products

DELETE /api/products/:id
Delete product

### Payments

POST /api/create-subscription
Creates Mercado Pago subscription and returns checkout URL

### Webhooks

POST /api/webhooks/mercadopago

Handles:
- authorized → activate PRO
- paused → downgrade
- cancelled → downgrade

## Mercado Pago Integration

### Subscription Creation
    {
        reason: "Caja Clara Pro",
        auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 390,
            currency_id: "UYU"
        },
        back_url: "https://myapp.com/dashboard"
    }

### Webhook Handling Logic (javascript)

    if (status === "authorized") {
        plan = "pro"
        plan_status = "active"
    }

    if (status === "paused" || status === "cancelled") {
        plan = "free"
        plan_status = status
    }

### Important Rules
Never trust frontend for payment state
Always validate with Mercado Pago API
Only allow one subscription per user

## Authentication

Supabase Auth (email/password)

### Protected Routes

/dashboard → authenticated only
PRO features → require plan === "pro"

## Frontend Structure

### Pages

- / → Landing page
- /dashboard → Product list
- /product/new → Create product
- /product/[id] → Result view
- /pricing → Upgrade page

### Components

- ProductCard
- CalculatorForm
- ResultDisplay
- PriceSlider
- UpgradeModal

## UX Principles
- Minimal inputs
- Fast interaction
- Large numbers (money focus)
- Clear states (win / warning / loss)

## Core UX Rule

Always show:
- Profit
- Margin
- Suggested price

## Background Jobs

Run a daily cron job:
- Sync Mercado Pago subscriptions
- Update user plan_status

## Deployment

### Services

Vercel → frontend/backend
Supabase → database + auth
Mercado Pago → payments

### Environment Variables

MP_ACCESS_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

## Pricing Strategy

### Free

1 product

### Pro

- UYU450 per month
- Unlimited products
- Advanced features