import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

interface AccordionProps extends React.ComponentProps<typeof Accordion> {}

const M3Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, ...props }, ref) => {
    return (
      <Accordion ref={ref} {...props}>
        {children}
      </Accordion>
    );
  }
);
M3Accordion.displayName = 'M3Accordion';

interface AccordionItemProps extends React.ComponentProps<typeof Accordion> {}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Accordion ref={ref} {...props}>
        {children}
      </Accordion>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ComponentProps<typeof AccordionSummary> {
  children: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<HTMLDivElement, AccordionTriggerProps>(
  ({ children, ...props }, ref) => (
    <AccordionSummary
      ref={ref}
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1a-content"
      id="panel1a-header"
      {...props}
    >
      <Typography>{children}</Typography>
    </AccordionSummary>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.ComponentProps<typeof AccordionDetails> {}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, ...props }, ref) => (
    <AccordionDetails ref={ref} {...props}>
      {children}
    </AccordionDetails>
  )
);
AccordionContent.displayName = 'AccordionContent';

export {
  M3Accordion as Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
