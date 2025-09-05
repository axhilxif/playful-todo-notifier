import * as React from 'react';
import MuiAlert from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

interface AlertProps extends React.ComponentProps<typeof MuiAlert> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    let severity: 'success' | 'info' | 'warning' | 'error' = 'info';
    if (variant === 'destructive') {
      severity = 'error';
    }

    return (
      <MuiAlert
        ref={ref}
        severity={severity}
        variant="outlined" // Using outlined for a cleaner M3 look, can be adjusted
        className={className}
        {...props}
      >
        {children}
      </MuiAlert>
    );
  }
);
Alert.displayName = 'Alert';

interface AlertTitleProps extends React.ComponentProps<typeof MuiAlertTitle> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <MuiAlertTitle ref={ref} className={className} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

interface AlertDescriptionProps extends React.ComponentProps<typeof Typography> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <Typography ref={ref} variant="body2" className={className} {...props}>
      {children}
    </Typography>
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
