import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'

function ScrollAreaRoot({ className, ...props }) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    />
  )
}

function ScrollAreaViewport({ className, ...props }) {
  return (
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn(
        'focus-visible:ring-ring/50 h-full w-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
        className
      )}
      {...props}
    />
  )
}

function ScrollArea({ className, children, ...props }) {
  return (
    <ScrollAreaRoot className={className} {...props}>
      <ScrollAreaViewport>{children}</ScrollAreaViewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaRoot>
  )
}

function ScrollBar({ className, orientation = 'vertical', ...props }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollAreaRoot, ScrollAreaViewport, ScrollBar }
