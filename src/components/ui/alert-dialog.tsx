import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

interface AlertDialogProps extends React.ComponentProps<typeof Dialog> {}

const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ children, ...props }, ref) => {
    return (
      <Dialog ref={ref} {...props}>
        {children}
      </Dialog>
    );
  }
);
AlertDialog.displayName = 'AlertDialog';

interface AlertDialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  onClick?: () => void;
}

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick });
};

interface AlertDialogContentProps extends React.ComponentProps<typeof DialogContent> {}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  (props, ref) => <DialogContent ref={ref} {...props} />
);
AlertDialogContent.displayName = 'AlertDialogContent';

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

interface AlertDialogFooterProps extends React.ComponentProps<typeof DialogActions> {}

const AlertDialogFooter = React.forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  (props, ref) => <DialogActions ref={ref} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

interface AlertDialogTitleProps extends React.ComponentProps<typeof DialogTitle> {}

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  (props, ref) => <DialogTitle ref={ref} {...props} />
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

interface AlertDialogDescriptionProps extends React.ComponentProps<typeof DialogContentText> {}

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  (props, ref) => <DialogContentText ref={ref} {...props} />
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

interface AlertDialogActionProps extends React.ComponentProps<typeof Button> {}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  (props, ref) => <Button ref={ref} variant="contained" {...props} />
);
AlertDialogAction.displayName = 'AlertDialogAction';

interface AlertDialogCancelProps extends React.ComponentProps<typeof Button> {}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  (props, ref) => <Button ref={ref} variant="outlined" {...props} />
);
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
