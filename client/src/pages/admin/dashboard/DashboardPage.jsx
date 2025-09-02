import { useState, useEffect, useRef } from 'react';
import { getDashboardData, getAvailableYears } from '../../../services/api';
import RevenueChart from '../../../components/Dashboard/RevenueChart';
import CategoryPieChart from '../../../components/Dashboard/CategoryPieChart';
import StatsCards from '../../../components/Dashboard/StatsCards';
import './DashboardPage.css';

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetched = useRef(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const yearsResponse = await getAvailableYears();
        if (yearsResponse.success) {
          setAvailableYears(yearsResponse.data);
          
          // If the current year is not available, select the first year.
          const currentYear = new Date().getFullYear();
          const yearToSelect = yearsResponse.data.includes(currentYear) 
            ? currentYear 
            : yearsResponse.data[0];
          
          setSelectedYear(yearToSelect);
        
        } else {
          setError('Failed to load available years');
        }
      } catch (err) {
        setError('Failed to initialize dashboard');
        console.error('Error initializing dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (!hasFetched.current) {
      hasFetched.current = true;
      window.scrollTo({ top: 0 });
      initializeDashboard();
    }
  }, []);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear) {
      fetchDashboardData(selectedYear);
    }
  }, [selectedYear, availableYears]);

  const fetchDashboardData = async (year) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getDashboardData(year);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchDashboardData(selectedYear)}
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-no-data">
        <p>No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your bookstore performance</p>
      </div>

      <StatsCards 
        generalStats={dashboardData.generalStats}
      />

      <div className="charts-section">
        <div className="chart-container revenue-chart">
          <RevenueChart 
            data={dashboardData.monthlyRevenue}
            year={selectedYear}
            onYearChange={handleYearChange}
            availableYears={availableYears}
          />
        </div>
        
        <div className="chart-container pie-chart">
          <CategoryPieChart data={dashboardData.categorySales} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;