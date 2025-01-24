import PropTypes from 'prop-types';
import { ar } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';

// Add this CSS-in-JS style block (or include in your CSS file)
const customStyles = `
  .my-selected:not([disabled]) { 
    font-weight: bold; 
    border: 2px solid #3b82f6;
    background-color: #bfdbfe;
    color: #1e40af;
  }
  
  .my-selected:hover:not([disabled]) { 
    background-color: #93c5fd;
  }
  
  .my-range_start:not([disabled]) {
    background-color: #3b82f6 !important;
    color: white !important;
  }
  
  .my-range_end:not([disabled]) {
    background-color: #3b82f6 !important;
    color: white !important;
  }
  
  .my-range_middle:not([disabled]) {
    background-color: #bfdbfe;
    color: #1e40af;
  }
`;

function Calendar({ selected, onSelect, mode = 'single' }) {
  return (
    <>
      {' '}
      <style>{customStyles}</style>
      <DayPicker
        locale={ar}
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        modifiers={{
          clickable: true,
        }}
        modifiersClassNames={{
          selected: 'my-selected',
          range_start: 'my-range_start',
          range_end: 'my-range_end',
          range_middle: 'my-range_middle',
        }}
        className="p-5 rounded-lg border"
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
