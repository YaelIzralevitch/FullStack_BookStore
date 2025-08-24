
function StatsCards({ generalStats }) {
  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  const statsData = [
    {
      title: "Total Orders This Year",
      value: generalStats.orders_this_year,
      icon: "📦",
      color: "blue"
    },
    {
      title: "Revenue This Year",
      value: formatCurrency(generalStats.revenue_this_year),
      icon: "💰",
      color: "green"
    },
    {
      title: "Books in Stock",
      value: generalStats.total_books_in_stock.toLocaleString(),
      icon: "📚",
      color: "orange"
    },
    {
      title: "Categories",
      value: generalStats.total_categories,
      icon: "📂",
      color: "purple"
    }
  ];

  return (
    <div className="stats-section">
      <div className="stats-cards">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsCards;