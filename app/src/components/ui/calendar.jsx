import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';

// Add this CSS-in-JS style block (or include in your CSS file)
const customStyles = `
  .my-selected:not([disabled]) { 
    font-weight: bold; 
    border: 2px solid var(--primary);
    background-color: var(--muted);
    color: var(--accent);
  }
  
  .my-selected:hover:not([disabled]) { 
    background-color: var(--border);
  }
  
  .my-range_start:not([disabled]) {
    background-color: var(--primary); !important;
    color: white !important;
  }
  
  .my-range_end:not([disabled]) {
    background-color: var(--primary); !important;
    color: white !important;
  }
  
  .my-range_middle:not([disabled]) {
    background-color: var(--muted);
    color: var(--accent);
  }
`;

function Calendar({ selected, onSelect, mode = 'single' }) {
  return (
    <>
      <style>{customStyles}</style>
      <DayPicker
        // dynamic props
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        // static props
        disabled={{ after: new Date() }}
        locale={ar}
        modifiers={{
          clickable: true,
        }}
        modifiersClassNames={{
          selected: 'my-selected',
          range_start: 'my-range_start',
          range_end: 'my-range_end',
          range_middle: 'my-range_middle',
        }}
        className="rounded-lg border bg-background p-5 shadow-xs transition-shadow duration-200 hover:shadow-md"
      />
    </>
  );
}

Calendar.propTypes = {
  selected: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.shape({
      from: PropTypes.instanceOf(Date),
      to: PropTypes.instanceOf(Date),
    }),
  ]),
  onSelect: PropTypes.func,
  mode: PropTypes.oneOf(['single', 'range']),
};

Calendar.displayName = 'Calendar';

export { Calendar };
