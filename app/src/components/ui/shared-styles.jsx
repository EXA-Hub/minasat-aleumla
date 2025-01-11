import PropTypes from 'prop-types'; // Import PropTypes
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

// Animation utility classes
const fadeIn = 'transition-opacity duration-200 ease-in-out';
const scaleIn = 'transition-transform duration-200 ease-in-out hover:scale-102';

// Consistent color mapping
const colorVariants = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-600' },
  green: { bg: 'bg-green-500/20', text: 'text-green-600' },
  red: { bg: 'bg-red-500/20', text: 'text-red-600' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-600' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-600' },
};

export const PageTitle = ({ children, className, ...props }) => (
  <h1
    className={cn(
      'text-3xl font-bold mb-8 text-right text-foreground',
      'md:text-4xl lg:text-5xl',
      'tracking-tight',
      fadeIn,
      className
    )}
    {...props}
  >
    {children}
  </h1>
);

PageTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const SectionTitle = ({ children, className, ...props }) => (
  <h2
    className={cn(
      'text-xl font-semibold mb-6 text-right text-foreground',
      'md:text-2xl',
      'tracking-tight',
      fadeIn,
      className
    )}
    {...props}
  >
    {children}
  </h2>
);

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const IconWrapper = ({
  children,
  color = 'blue',
  className,
  ...props
}) => (
  <div
    className={cn(
      colorVariants[color].bg,
      'p-3 rounded-full',
      'transition-all duration-200 hover:scale-105',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

IconWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'yellow']),
  className: PropTypes.string,
};

export const StatsCard = ({ icon: Icon, title, value, color = 'blue' }) => (
  <div
    className={cn(
      'p-6 bg-card rounded-xl border shadow-sm',
      'hover:shadow-md transition-shadow duration-200',
      'group'
    )}
  >
    <div className="flex items-center gap-4">
      <IconWrapper color={color}>
        <Icon
          className={cn(
            'h-6 w-6',
            colorVariants[color].text,
            'group-hover:scale-110 transition-transform duration-200'
          )}
        />
      </IconWrapper>
      <div className="space-y-2 text-right">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </div>
      </div>
    </div>
  </div>
);

StatsCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple', 'yellow']),
};

export const DataTable = ({ columns, data }) => (
  <div className="overflow-x-auto rounded-lg border">
    <table className="w-full">
      <thead className="bg-muted/50">
        <tr>
          {columns.map((column, i) => (
            <th
              key={i}
              className="px-4 py-3 font-medium text-right text-foreground text-sm"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            className={cn(
              'border-t border-border',
              'hover:bg-muted/50 transition-colors duration-200'
            )}
          >
            {columns.map((column, j) => (
              <td key={j} className="px-4 py-3 text-right">
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      cell: PropTypes.func.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export const ChartContainer = ({ children, className, ...props }) => (
  <div
    className={cn(
      'h-[400px] w-full bg-card rounded-xl border p-6',
      'shadow-sm hover:shadow-md transition-shadow duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

ChartContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const inputStyles = cva(
  [
    'w-full p-3 rounded-lg border bg-background',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'placeholder:text-muted-foreground',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-all duration-200',
  ],
  {
    variants: {
      error: {
        true: 'border-red-500 focus:ring-red-500',
        false: 'border-border',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export const FormInput = ({ label, error, className, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-right text-foreground">
        {label}
      </label>
    )}
    <input className={cn(inputStyles({ error }), className)} {...props} />
    {error && <p className="text-sm text-red-500 text-right mt-1">{error}</p>}
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export const FormTextArea = ({ label, error, className, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-right text-foreground">
        {label}
      </label>
    )}
    <textarea
      className={cn(
        inputStyles({ error }),
        'min-h-[100px] resize-y',
        className
      )}
      {...props}
    />
    {error && <p className="text-sm text-red-500 text-right mt-1">{error}</p>}
  </div>
);

FormTextArea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

const buttonVariants = cva(
  [
    'px-4 py-2 rounded-lg font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        secondary:
          'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
      },
      size: {
        sm: 'text-sm px-3 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const ActionButton = ({
  children,
  variant,
  size,
  className,
  ...props
}) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  >
    {children}
  </button>
);

ActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};
