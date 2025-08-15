const dashboardController = require("../controllers/dashboard.controller");

/**
 * קבלת נתוני דשבורד מלאים
 */
async function getDashboardData(year = new Date().getFullYear()) {
  try {
    const [
      monthlyRevenue,
      categorySales,
      generalStats
    ] = await Promise.all([
      dashboardController.getMonthlyRevenue(year),
      dashboardController.getCategorySales(year),
      dashboardController.getGeneralStats()
    ]);

    return {
      code: 200,
      data: {
        year: parseInt(year),
        monthlyRevenue,
        categorySales,
        generalStats
      },
      msg: "Dashboard data retrieved successfully"
    };
  } catch (error) {
    console.error('ERROR IN getDashboardData service:', error);
    return {
      code: 500,
      msg: error.message || "Failed to retrieve dashboard data"
    };
  }
}

/**
 * קבלת רשימת שנים זמינות (לסלקטור)
 */
async function getAvailableYears() {
  try {
    const years = await dashboardController.getAvailableYears();
    
    return {
      code: 200,
      data: years,
      msg: "Available years retrieved successfully"
    };
  } catch (error) {
    console.error('ERROR IN getAvailableYears service:', error);
    return {
      code: 500,
      msg: error.message || "Failed to retrieve available years"
    };
  }
}

module.exports = {
  getDashboardData,
  getAvailableYears
};