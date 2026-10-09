import { SearchIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useQuickSearchShortcut } from '@/features/quick-search/hooks/useQuickSearchShortcut'
import { QuickSearchDialog } from '@/features/quick-search/components/QuickSearchDialog'

export function QuickSearchBar() {
  const { open, setOpen } = useQuickSearchShortcut()

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="text-muted-foreground size-9 shrink-0 justify-center p-0 sm:h-9 sm:w-full sm:max-w-md sm:justify-start sm:gap-2 sm:px-3"
      >
        <SearchIcon className="size-4 shrink-0 opacity-60" />
        <span className="hidden truncate font-normal sm:inline">
          Buscar por CPF, Nome ou nº do processo
        </span>
        <kbd className="bg-muted ml-auto hidden items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
          Ctrl + K
        </kbd>
      </Button>

      <QuickSearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
