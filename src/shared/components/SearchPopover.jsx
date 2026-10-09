import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'

export function SearchPopover({
  id,
  label,
  placeholder,
  searchPlaceholder,
  searchLabel = searchPlaceholder,
  open,
  onOpenChange,
  query,
  onQueryChange,
  items,
  onSelect,
  renderItem,
  isLoading,
  error,
  disabled,
  minLength = 1,
  emptyMessage = 'Nenhum resultado encontrado.',
  loadingMessage = 'Buscando...',
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-required': required,
}) {
  const changeOpen = (next) => {
    onOpenChange(next)
    if (!next) onQueryChange('')
  }
  const ready = query.trim().length >= minLength
  return (
    <Popover open={open && !disabled} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label={label}
          aria-expanded={open && !disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-required={required}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="text-muted-foreground truncate">{placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) gap-0 p-0"
      >
        <Command shouldFilter={false} label={searchLabel}>
          <CommandInput
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={onQueryChange}
          />
          <CommandList className="max-h-60">
            {ready &&
              (isLoading ? (
                <p role="status" className="text-muted-foreground px-3 py-2 text-sm">
                  {loadingMessage}
                </p>
              ) : error ? (
                <p role="alert" className="text-destructive px-3 py-2 text-sm">
                  {error}
                </p>
              ) : items.length === 0 ? (
                <p className="text-muted-foreground px-3 py-2 text-sm">{emptyMessage}</p>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      className="py-2"
                      onSelect={() => {
                        onSelect(item)
                        changeOpen(false)
                      }}
                    >
                      {renderItem(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
