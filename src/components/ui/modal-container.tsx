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
            "h-[90vh] overflow-y-auto rounded-t-[20px] pt-6",
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
        "max-h-[90vh] w-[90vw] max-w-[500px] overflow-y-auto",
        position === 'center' ? "sm:max-h-[85vh]" : "sm:max-h-[90vh] sm:translate-y-[5vh]",
        className
      )}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
