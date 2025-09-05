import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

interface CardProps extends React.ComponentProps<typeof Card> {
  variant?: 'elevated' | 'outlined';
}

const M3Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant === 'outlined' ? 'outlined' : 'elevation'} // Map to MUI variants
        className={className}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

M3Card.displayName = 'M3Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const M3CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div className={className} {...props}>
      {children}
    </div>
  )
);
M3CardHeader.displayName = 'M3CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const M3CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);
M3CardTitle.displayName = 'M3CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const M3CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={className} {...props}>
      {children}
    </p>
  )
);
M3CardDescription.displayName = 'M3CardDescription';

interface CardContentProps extends React.ComponentProps<typeof CardContent> {}

const M3CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <CardContent ref={ref} className={className} {...props} />
  )
);
M3CardContent.displayName = 'M3CardContent';

interface CardFooterProps extends React.ComponentProps<typeof CardActions> {}

const M3CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <CardActions ref={ref} className={className} {...props} />
  )
);
M3CardFooter.displayName = 'M3CardFooter';

export {
  M3Card as Card,
  M3CardHeader as CardHeader,
  M3CardFooter as CardFooter,
  M3CardTitle as CardTitle,
  M3CardDescription as CardDescription,
  M3CardContent as CardContent,
};
