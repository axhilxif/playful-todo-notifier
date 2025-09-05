import * as React from 'react';
import Avatar from '@mui/material/Avatar';

interface AvatarProps extends React.ComponentProps<typeof Avatar> {}

const M3Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    return (
      <Avatar ref={ref} className={className} {...props} />
    );
  }
);

M3Avatar.displayName = 'M3Avatar';

interface AvatarImageProps extends React.ComponentProps<typeof Avatar> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <Avatar ref={ref} className={className} {...props} />
  )
);
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.ComponentProps<typeof Avatar> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <Avatar ref={ref} className={className} {...props} />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { M3Avatar as Avatar, AvatarImage, AvatarFallback };
