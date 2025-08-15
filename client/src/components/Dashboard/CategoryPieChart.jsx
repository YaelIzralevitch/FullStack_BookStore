import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function CategoryPieChart({ data }) {
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
    '#00ff00', '#ff00ff', '#00ffff', '#ffff00'
  ];

  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="pie-tooltip">
          <p className="tooltip-label">{data.category_name}</p>
          <p className="tooltip-sales">Sales: {formatCurrency(data.total_sales)}</p>
          <p className="tooltip-books">Books Sold: {data.books_sold}</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    const percent = ((entry.total_sales / data.reduce((sum, item) => sum + item.total_sales, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="category-pie-container">
      <h2>Sales by Category</h2>
      
      <div className="pie-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="total_sales"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-legend">
        {data.map((category, index) => (
          <div key={category.category_id} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="legend-text">
              {category.category_name} ({formatCurrency(category.total_sales)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPieChart;