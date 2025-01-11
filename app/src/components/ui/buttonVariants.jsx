import { cva } from 'class-variance-authority';
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        subtle:
          'bg-primary/20 text-primary-foreground/80 hover:bg-primary/30 hover:text-primary-foreground',
        ghost:
          'bg-transparent text-primary-foreground border border-transparent hover:bg-primary/10 hover:text-primary-foreground/90',
        danger:
          'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:text-white',
        success:
          'bg-green-600 text-white shadow-lg hover:bg-green-700 hover:text-white',
        warning:
          'bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 px-10 py-3 text-lg',
        xxl: 'h-14 px-12 py-4 text-xl',
        mini: 'h-6 px-2 text-xs',
        wide: 'h-10 px-16 py-2 text-base',
        icon: 'h-10 w-10 flex items-center justify-center rounded-full', // New icon style
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
export { buttonVariants };
