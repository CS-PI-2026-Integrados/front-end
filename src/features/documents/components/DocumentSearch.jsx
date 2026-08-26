import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

export function DocumentSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Buscar por nome ou processo..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-64 pl-9"
      />
    </div>
  )
}
