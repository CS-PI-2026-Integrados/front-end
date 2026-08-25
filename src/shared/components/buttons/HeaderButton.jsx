import { Button } from '../ui/button'

export function HeaderButton({ icon: Icon, text, onClick }) {
  return (
    <Button
      size="sm"
      className="bg-primary hover:bg-primary/90 mb-0.5 min-w-40 cursor-pointer gap-2 px-4 text-sm font-medium shadow-sm"
      onClick={onClick}
    >
      <Icon />
      {text}
    </Button>
  )
}
