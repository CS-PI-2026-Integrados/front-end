import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export function YearSelector({ years, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Ano:</span>
      <Select value={String(value)} onValueChange={(year) => onChange(Number(year))}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
