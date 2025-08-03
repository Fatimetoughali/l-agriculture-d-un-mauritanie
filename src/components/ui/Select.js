import { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Sélectionner...', 
  className = '',
  required = false,
  ...props 
}, ref) => {
  const selectClasses = `
    block w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select ref={ref} className={selectClasses} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
