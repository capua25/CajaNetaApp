'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductList } from '@/components/products/ProductList'
import { ResultDisplay } from '@/components/calculator/ResultDisplay'
import { CalculatorForm } from '@/components/calculator/CalculatorForm'
import { calculate } from '@/lib/calculator'
import type { Product } from '@/lib/types'

interface DashboardProductsSectionProps {
  products: Product[]
  isFreePlan: boolean
  planStatus?: string
}

export function DashboardProductsSection({ products, isFreePlan, planStatus }: DashboardProductsSectionProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<'detail' | 'edit' | null>(null)

  function openDetail(product: Product) {
    setSelectedProduct(product)
    setModalMode('detail')
  }

  function openEdit(product: Product) {
    setSelectedProduct(product)
    setModalMode('edit')
  }

  function closeModal() {
    setSelectedProduct(null)
    setModalMode(null)
  }

  function handleEditSuccess() {
    closeModal()
    router.refresh()
  }

  const result = selectedProduct ? calculate(selectedProduct) : null

  return (
    <>
      <ProductList
        products={products}
        isFreePlan={isFreePlan}
        planStatus={planStatus}
        onDetail={openDetail}
        onEdit={openEdit}
      />

      <Dialog open={modalMode !== null} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === 'edit' ? 'Editar producto' : selectedProduct?.name ?? ''}</DialogTitle>
            <DialogDescription className="sr-only">
              {modalMode === 'edit' ? 'Formulario para editar el producto' : 'Detalle del producto'}
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
          {modalMode === 'edit' && selectedProduct && (
            <CalculatorForm
              product={selectedProduct}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
