'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductList } from '@/components/products/ProductList'
import { NewProductButton } from '@/components/products/NewProductButton'
import { ResultDisplay } from '@/components/calculator/ResultDisplay'
import { CalculatorForm } from '@/components/calculator/CalculatorForm'
import { BulkSalesModal } from '@/components/dashboard/BulkSalesModal'
import { calculate } from '@/lib/calculator'
import type { Product, Plan } from '@/lib/types'

interface DashboardProductsSectionProps {
  products: Product[]
  isFreePlan: boolean
  planStatus?: string
  isFreeLimitReached: boolean
  plan: Plan
}

export function DashboardProductsSection({ products, isFreePlan, planStatus, isFreeLimitReached, plan }: DashboardProductsSectionProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<'detail' | 'edit' | 'new' | null>(null)
  const [bulkSalesOpen, setBulkSalesOpen] = useState(false)

  function openDetail(product: Product) {
    setSelectedProduct(product)
    setModalMode('detail')
  }

  function openEdit(product: Product) {
    setSelectedProduct(product)
    setModalMode('edit')
  }

  function openNew() {
    setSelectedProduct(null)
    setModalMode('new')
  }

  function closeModal() {
    setSelectedProduct(null)
    setModalMode(null)
  }

  function handleFormSuccess() {
    closeModal()
    router.refresh()
  }

  const result = selectedProduct ? calculate(selectedProduct) : null
  const planForButton = plan === 'pro' ? 'plus' : plan as 'free' | 'plus'

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        {!isFreePlan && products.length > 0 && (
          <Button variant="outline" onClick={() => setBulkSalesOpen(true)}>
            Actualizar ventas mensuales
          </Button>
        )}
        <NewProductButton
          isFreeLimitReached={isFreeLimitReached}
          plan={planForButton}
          onNew={openNew}
        />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">Todavía no tenés productos</p>
          <Button onClick={openNew}>Calcular mi primer producto</Button>
        </div>
      ) : (
        <ProductList
          products={products}
          isFreePlan={isFreePlan}
          planStatus={planStatus}
          onDetail={openDetail}
          onEdit={openEdit}
        />
      )}

      <BulkSalesModal
        open={bulkSalesOpen}
        onClose={() => setBulkSalesOpen(false)}
        products={products}
        onSuccess={() => { setBulkSalesOpen(false); router.refresh() }}
      />

      <Dialog open={modalMode !== null} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'new' ? 'Nuevo producto' : modalMode === 'edit' ? 'Editar producto' : selectedProduct?.name ?? ''}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {modalMode === 'new' ? 'Formulario para crear un producto' : modalMode === 'edit' ? 'Formulario para editar el producto' : 'Detalle del producto'}
            </DialogDescription>
          </DialogHeader>
          {modalMode === 'detail' && selectedProduct && result && (
            <ResultDisplay
              product={selectedProduct}
              result={result}
              onEdit={() => setModalMode('edit')}
              onClose={closeModal}
            />
          )}
          {(modalMode === 'edit' || modalMode === 'new') && (
            <CalculatorForm
              product={modalMode === 'edit' ? selectedProduct ?? undefined : undefined}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
