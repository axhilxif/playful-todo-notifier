import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "./sheet"
import { Dialog, DialogContent } from "./dialog"
import { useIsMobile } from "@/hooks/use-mobile"

interface ModalContainerProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
  position?: 'bottom' | 'center'
}

export function ModalContainer({
  children,
  isOpen,
  onClose,
  className,
  position = 'center'
}: ModalContainerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className={cn(
            "h-auto max-h-[90vh] w-full max-w-none overflow-y-auto overscroll-contain shadow-lg p-0 rounded-t-3xl",
            className
          )}
        >
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "inset-x-0 mx-auto w-[92vw] max-w-[640px] max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl shadow-lg top-[8vh] translate-x-0 translate-y-0 p-4",
        className
      )}>
        {children}
      </DialogContent>
    </Dialog>
  )
}