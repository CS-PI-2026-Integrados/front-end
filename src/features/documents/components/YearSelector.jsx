import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export function YearSelector({ years, value, onChange, disabled = false }) {
  return (
    <div className="w-full shrink-0 lg:w-44">
      <Select
        disabled={disabled}
        value={String(value)}
        onValueChange={(year) => onChange(Number(year))}
      >
        <SelectTrigger
          aria-label="Ano dos documentos"
          className="hover:bg-muted w-full cursor-pointer"
        >
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
