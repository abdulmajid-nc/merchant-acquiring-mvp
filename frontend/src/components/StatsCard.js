import React from 'react';

/**
 * Standardized StatsCard component to ensure consistent styling
 * across different parts of the application.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.change - Change indicator (e.g., "+12.5%")
 * @param {string} props.period - Period descriptor (e.g., "vs last month")
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.iconColor - Color class for the icon (e.g., "text-green-600")
 */
const StatsCard = ({ 
  title, 
  value, 
  change, 
  period, 
  icon, 
  iconColor = "text-blue-600" 
}) => {
  // Determine if change is positive or negative
  const isPositiveChange = change && change.startsWith('+');
  const changeColorClass = isPositiveChange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h6 className="text-gray-500 text-sm font-medium">{title}</h6>
        {icon && (
          <div className={iconColor}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1">{value}</h2>
        {change && (
          <div className="flex items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${changeColorClass}`}>
              {change}
            </span>
            {period && <span className="text-gray-500 text-xs ml-2">{period}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
