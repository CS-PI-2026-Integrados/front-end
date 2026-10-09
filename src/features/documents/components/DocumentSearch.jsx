import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

export function DocumentSearch({ value, onChange }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Buscar por nome ou processo..."
        aria-label="Buscar documentos por nome ou processo"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full pl-9"
      />
    </div>
  )
}
