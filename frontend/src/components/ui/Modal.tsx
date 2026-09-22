import * as Dialog from '@radix-ui/react-dialog'
import { IoCloseSharp } from 'react-icons/io5'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-700 bg-black p-6 shadow-xl focus:outline-none"
        >
          <div className="mb-4 flex items-center justify-between">
            {title ? (
              <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
            ) : (
              <Dialog.Title className="sr-only">Dialog</Dialog.Title>
            )}
            <Dialog.Close
              type="button"
              aria-label="Close"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <IoCloseSharp className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
