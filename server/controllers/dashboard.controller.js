const pool = require("../config/db");

/**
 * get monthly revenue data for a given year
 */
async function getMonthlyRevenue(year) {
  try {
    const [results] = await pool.query(`
      SELECT 
        MONTH(created_at) as month,
        COUNT(*) as order_count,
        SUM(total_price) as total_revenue
      FROM orders 
      WHERE YEAR(created_at) = ? AND order_status = 'paid'
      GROUP BY MONTH(created_at)
      ORDER BY month
    `, [year]);

    // create an array with all 12 months, filling in zeros where needed
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const found = results.find(r => r.month === month);
      return {
        month,
        monthName: getMonthName(month),
        order_count: found ? found.order_count : 0,
        total_revenue: found ? parseFloat(found.total_revenue) : 0
      };
    });

    return monthlyData;
  } catch (error) {
    console.error('ERROR IN getMonthlyRevenue:', error);
    throw error;
  }
}

/**
 * get sales data per category for a given year
 */
async function getCategorySales(year = new Date().getFullYear()) {
  try {
    const [results] = await pool.query(`
      SELECT 
        c.name as category_name,
        c.id as category_id,
        COUNT(od.book_id) as books_sold,
        SUM(od.quantity * od.unit_price) as total_sales
      FROM order_details od
      JOIN orders o ON od.order_id = o.id
      JOIN books b ON od.book_id = b.id
      JOIN categories c ON b.category_id = c.id
      WHERE YEAR(o.created_at) = ? AND o.order_status = 'paid'
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `, [year]);

    return results.map(result => ({
      category_id: result.category_id,
      category_name: result.category_name,
      books_sold: result.books_sold,
      total_sales: parseFloat(result.total_sales)
    }));
  } catch (error) {
    console.error('ERROR IN getCategorySales:', error);
    throw error;
  }
}

/**
 * get general stats for dashboard
 */
async function getGeneralStats() {
  try {
    // number of orders this year
    const [[ordersCount]] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE YEAR(created_at) = YEAR(NOW())
    `);

    // revenue this year
    const [[yearRevenue]] = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as revenue 
      FROM orders 
      WHERE YEAR(created_at) = YEAR(NOW()) AND order_status = 'paid'
    `);

    // total books in stock
    const [[totalBooks]] = await pool.query(`
      SELECT SUM(stock_quantity) as total_stock 
      FROM books
    `);

    // count of categories
    const [[categoriesCount]] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM categories
    `);

    return {
      orders_this_year: ordersCount.count,
      revenue_this_year: parseFloat(yearRevenue.revenue),
      total_books_in_stock: totalBooks.total_stock,
      total_categories: categoriesCount.count
    };
  } catch (error) {
    console.error('ERROR IN getGeneralStats:', error);
    throw error;
  }
}


/**
 * get available years from orders data
 */
async function getAvailableYears() {
  try {
    const [results] = await pool.query(`
      SELECT DISTINCT YEAR(created_at) as year
      FROM orders 
      WHERE created_at IS NOT NULL
      ORDER BY year DESC
    `);

    const years = results.map(result => result.year);
    
    // if no years found, return current year
    if (years.length === 0) {
      return [new Date().getFullYear()];
    }
    
    return years;
  } catch (error) {
    console.error('ERROR IN getAvailableYears:', error);
    throw error;
  }
}

/**
 * help function to get month name from month number
 */
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

module.exports = {
  getMonthlyRevenue,
  getCategorySales,
  getGeneralStats,
  getAvailableYears
};