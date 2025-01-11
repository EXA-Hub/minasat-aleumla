import * as React from 'react';
import PropTypes from 'prop-types';

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div dir="rtl" className="relative w-full overflow-auto z-10">
    <table
      ref={ref}
      dir="rtl"
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

Table.propTypes = {
  className: PropTypes.string,
};

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    dir="rtl"
    className={`[&_tr]:border-b ${className}`}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

TableHeader.propTypes = {
  className: PropTypes.string,
};

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    dir="rtl"
    className={`[&_tr:last-child]:border-0 ${className}`}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

TableBody.propTypes = {
  className: PropTypes.string,
};

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    dir="rtl"
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

TableRow.propTypes = {
  className: PropTypes.string,
};

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    dir="rtl"
    className={`h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

TableHead.propTypes = {
  className: PropTypes.string,
};

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    dir="rtl"
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

TableCell.propTypes = {
  className: PropTypes.string,
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
