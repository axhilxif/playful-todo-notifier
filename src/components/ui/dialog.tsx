import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface DialogProps extends React.ComponentProps<typeof Dialog> {}

const M3Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ children, ...props }, ref) => {
    return (
      <Dialog ref={ref} {...props}>
        {children}
      </Dialog>
    );
  }
);
M3Dialog.displayName = 'M3Dialog';

interface DialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  onClick?: () => void;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick });
};

interface DialogCloseProps extends React.ComponentProps<typeof IconButton> {}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  (props, ref) => (
    <IconButton ref={ref} {...props}>
      <CloseIcon />
    </IconButton>
  )
);
DialogClose.displayName = 'DialogClose';

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
DialogHeader.displayName = 'DialogHeader';

interface DialogFooterProps extends React.ComponentProps<typeof DialogActions> {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  (props, ref) => <DialogActions ref={ref} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

interface DialogTitleProps extends React.ComponentProps<typeof DialogTitle> {}

const M3DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  (props, ref) => <DialogTitle ref={ref} {...props} />
);
M3DialogTitle.displayName = 'M3DialogTitle';

interface DialogDescriptionProps extends React.ComponentProps<typeof DialogContentText> {}

const M3DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  (props, ref) => <DialogContentText ref={ref} {...props} />
);
M3DialogDescription.displayName = 'M3DialogDescription';

interface DialogContentProps extends React.ComponentProps<typeof DialogContent> {}

const M3DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (props, ref) => <DialogContent ref={ref} {...props} />
);
M3DialogContent.displayName = 'M3DialogContent';

export {
  M3Dialog as Dialog,
  DialogTrigger,
  DialogClose,
  M3DialogContent as DialogContent,
  DialogHeader,
  DialogFooter,
  M3DialogTitle as DialogTitle,
  M3DialogDescription as DialogDescription,
};
