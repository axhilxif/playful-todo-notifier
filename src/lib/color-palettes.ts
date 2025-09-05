export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    // Define all CSS variables used in index.css that should be customizable
    // Light mode colors
    '--background-light': string;
    '--foreground-light': string;
    '--primary-light': string;
    '--primary-foreground-light': string;
    '--secondary-light': string;
    '--secondary-foreground-light': string;
    '--accent-light': string;
    '--accent-foreground-light': string;
    '--card-light': string;
    '--card-foreground-light': string;
    '--border-light': string;
    '--input-light': string;
    '--ring-light': string;
    '--muted-light': string;
    '--muted-foreground-light': string;
    '--popover-light': string;
    '--popover-foreground-light': string;

    // Dark mode colors
    '--background-dark': string;
    '--foreground-dark': string;
    '--primary-dark': string;
    '--primary-foreground-dark': string;
    '--secondary-dark': string;
    '--secondary-foreground-dark': string;
    '--accent-dark': string;
    '--accent-foreground-dark': string;
    '--card-dark': string;
    '--card-foreground-dark': string;
    '--border-dark': string;
    '--input-dark': string;
    '--ring-dark': string;
    '--muted-dark': string;
    '--muted-foreground-dark': string;
    '--popover-dark': string;
    '--popover-foreground-dark': string;
  };
}

// Helper to define HSL values
const hsl = (h: number, s: number, l: number) => `${h} ${s}% ${l}%`;

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'default',
    name: 'Default (Lilac & Violet)',
    colors: {
      // Light mode
      '--background-light': hsl(270, 80, 98),
      '--foreground-light': hsl(0, 0, 15),
      '--primary-light': hsl(270, 80, 70),
      '--primary-foreground-light': hsl(0, 0, 100),
      '--secondary-light': hsl(280, 60, 60),
      '--secondary-foreground-light': hsl(0, 0, 100),
      '--accent-light': hsl(290, 70, 50),
      '--accent-foreground-light': hsl(0, 0, 100),
      '--card-light': hsl(0, 0, 100),
      '--card-foreground-light': hsl(0, 0, 15),
      '--border-light': hsl(270, 10, 90),
      '--input-light': hsl(270, 10, 95),
      '--ring-light': hsl(270, 80, 70),
      '--muted-light': hsl(270, 10, 95),
      '--muted-foreground-light': hsl(0, 0, 40),
      '--popover-light': hsl(0, 0, 98),
      '--popover-foreground-light': hsl(0, 0, 15),

      // Dark mode
      '--background-dark': hsl(0, 0, 10),
      '--foreground-dark': hsl(0, 0, 90),
      '--primary-dark': hsl(270, 70, 80),
      '--primary-foreground-dark': hsl(0, 0, 10),
      '--secondary-dark': hsl(280, 50, 70),
      '--secondary-foreground-dark': hsl(0, 0, 10),
      '--accent-dark': hsl(290, 60, 60),
      '--accent-foreground-dark': hsl(0, 0, 10),
      '--card-dark': hsl(0, 0, 10),
      '--card-foreground-dark': hsl(0, 0, 90),
      '--border-dark': hsl(270, 10, 25),
      '--input-dark': hsl(270, 10, 20),
      '--ring-dark': hsl(270, 70, 80),
      '--muted-dark': hsl(270, 10, 20),
      '--muted-foreground-dark': hsl(0, 0, 60),
      '--popover-dark': hsl(0, 0, 15),
      '--popover-foreground-dark': hsl(0, 0, 90),
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze (Blue & Green)',
    colors: {
      // Light mode
      '--background-light': hsl(200, 50, 95),
      '--foreground-light': hsl(200, 10, 20),
      '--primary-light': hsl(200, 70, 50),
      '--primary-foreground-light': hsl(0, 0, 100),
      '--secondary-light': hsl(140, 60, 40),
      '--secondary-foreground-light': hsl(0, 0, 100),
      '--accent-light': hsl(220, 80, 60),
      '--accent-foreground-light': hsl(0, 0, 100),
      '--card-light': hsl(0, 0, 100),
      '--card-foreground-light': hsl(200, 10, 20),
      '--border-light': hsl(200, 20, 80),
      '--input-light': hsl(200, 30, 90),
      '--ring-light': hsl(200, 70, 50),
      '--muted-light': hsl(200, 30, 90),
      '--muted-foreground-light': hsl(200, 10, 50),
      '--popover-light': hsl(0, 0, 98),
      '--popover-foreground-light': hsl(200, 10, 20),

      // Dark mode
      '--background-dark': hsl(200, 20, 15),
      '--foreground-dark': hsl(200, 10, 90),
      '--primary-dark': hsl(200, 60, 70),
      '--primary-foreground-dark': hsl(200, 20, 15),
      '--secondary-dark': hsl(140, 50, 60),
      '--secondary-foreground-dark': hsl(200, 20, 15),
      '--accent-dark': hsl(220, 70, 70),
      '--accent-foreground-dark': hsl(200, 20, 15),
      '--card-dark': hsl(200, 20, 15),
      '--card-foreground-dark': hsl(200, 10, 90),
      '--border-dark': hsl(200, 20, 30),
      '--input-dark': hsl(200, 20, 25),
      '--ring-dark': hsl(200, 60, 70),
      '--muted-dark': hsl(200, 20, 25),
      '--muted-foreground-dark': hsl(200, 10, 70),
      '--popover-dark': hsl(200, 20, 20),
      '--popover-foreground-dark': hsl(200, 10, 90),
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow (Orange & Pink)',
    colors: {
      // Light mode
      '--background-light': hsl(30, 80, 98),
      '--foreground-light': hsl(30, 10, 15),
      '--primary-light': hsl(30, 90, 60),
      '--primary-foreground-light': hsl(0, 0, 100),
      '--secondary-light': hsl(330, 70, 60),
      '--secondary-foreground-light': hsl(0, 0, 100),
      '--accent-light': hsl(10, 80, 50),
      '--accent-foreground-light': hsl(0, 0, 100),
      '--card-light': hsl(0, 0, 100),
      '--card-foreground-light': hsl(30, 10, 15),
      '--border-light': hsl(30, 20, 90),
      '--input-light': hsl(30, 30, 95),
      '--ring-light': hsl(30, 90, 60),
      '--muted-light': hsl(30, 30, 95),
      '--muted-foreground-light': hsl(30, 10, 40),
      '--popover-light': hsl(0, 0, 98),
      '--popover-foreground-light': hsl(30, 10, 15),

      // Dark mode
      '--background-dark': hsl(30, 20, 15),
      '--foreground-dark': hsl(30, 10, 90),
      '--primary-dark': hsl(30, 80, 70),
      '--primary-foreground-dark': hsl(30, 20, 15),
      '--secondary-dark': hsl(330, 60, 70),
      '--secondary-foreground-dark': hsl(30, 20, 15),
      '--accent-dark': hsl(10, 70, 60),
      '--accent-foreground-dark': hsl(30, 20, 15),
      '--card-dark': hsl(30, 20, 15),
      '--card-foreground-dark': hsl(30, 10, 90),
      '--border-dark': hsl(30, 20, 30),
      '--input-dark': hsl(30, 20, 25),
      '--ring-dark': hsl(30, 80, 70),
      '--muted-dark': hsl(30, 20, 25),
      '--muted-foreground-dark': hsl(30, 10, 70),
      '--popover-dark': hsl(30, 20, 20),
      '--popover-foreground-dark': hsl(30, 10, 90),
    },
  },
];