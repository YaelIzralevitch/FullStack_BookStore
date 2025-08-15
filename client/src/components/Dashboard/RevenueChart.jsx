import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RevenueChart({ data, year, onYearChange, availableYears }) {
  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-revenue">
            {`Revenue: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="tooltip-orders">
            {`Orders: ${payload[1].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="revenue-chart-container">
      <div className="chart-header">
        <h2>Monthly Revenue & Orders</h2>
        <select 
          value={year} 
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="year-selector"
        >
          {availableYears.map(yearOption => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis 
              dataKey="monthName" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              stroke="#059669"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="orders"
              orientation="right"
              stroke="#3b82f6"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="revenue"
              dataKey="total_revenue" 
              fill="#059669"
              name="Revenue ($)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="orders"
              dataKey="order_count" 
              fill="#3b82f6"
              name="Orders"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;