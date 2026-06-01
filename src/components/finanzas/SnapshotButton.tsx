'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SnapshotButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/finanzas/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'No se pudo guardar el snapshot')
      }
      setSuccess(true)
      setNote('')
      router.refresh()
      window.setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Guardar snapshot
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && !saving) setOpen(o)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar snapshot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Guardá una foto de tus finanzas actuales para verla en el histórico.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="snapshot-note" className="text-sm font-medium">
                Nota (opcional)
              </label>
              <input
                id="snapshot-note"
                type="text"
                value={note}
                maxLength={200}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !saving) {
                    e.preventDefault()
                    handleSave()
                  }
                }}
                placeholder="Ej: Cierre de marzo"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-600">¡Snapshot guardado!</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
