'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { use } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaDollarSign,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaPlus
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { TransactionType, LoanType, InvestmentType } from '@/lib/enums';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title
);

// Define interfaces
interface Project {
  _id: string;
  name: string;
  totalBudget: number;
}

interface Loan {
  _id: string;
  amount: number;
  remainingBalance: number;
  interestRate: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  lenderName: string;
  type: LoanType;
}

interface Investment {
  _id: string;
  amount: number;
  type: InvestmentType;
  investorName: string;
  expectedROI: number;
  actualROI: number;
  expectedReturns: number;
  actualReturns: number;
}

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
}

// Define colors for charts
const colors = {
  blue: 'rgba(54, 162, 235, 0.6)',
  blueLight: 'rgba(54, 162, 235, 0.2)',
  red: 'rgba(255, 99, 132, 0.6)',
  redLight: 'rgba(255, 99, 132, 0.2)',
  green: 'rgba(75, 192, 192, 0.6)',
  greenLight: 'rgba(75, 192, 192, 0.2)',
  orange: 'rgba(255, 159, 64, 0.6)',
  orangeLight: 'rgba(255, 159, 64, 0.2)',
  purple: 'rgba(153, 102, 255, 0.6)',
  purpleLight: 'rgba(153, 102, 255, 0.2)',
  yellow: 'rgba(255, 206, 86, 0.6)',
  yellowLight: 'rgba(255, 206, 86, 0.2)',
  grey: 'rgba(201, 203, 207, 0.6)',
  greyLight: 'rgba(201, 203, 207, 0.2)',
};

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export default function ProjectFinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  
  const rawParams = useParams();
  const params = use(rawParams);
  const projectId = params.id as string;
  
  // Financial metrics
  const [metrics, setMetrics] = useState({
    totalInvested: 0,
    totalLoans: 0,
    totalLoansRemaining: 0,
    totalExpenses: 0,
    totalRevenue: 0,
    cashFlow: 0,
    roi: 0,
    loanToValue: 0,
    debtCoverageRatio: 0
  });
  
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project details');
        }
        const projectData = await projectResponse.json();
        setProject(projectData);
        
        // Fetch loans
        const loansResponse = await fetch(`/api/projects/${projectId}/loans`);
        if (loansResponse.ok) {
          const loansData = await loansResponse.json();
          setLoans(loansData);
        }
        
        // Fetch investments
        const investmentsResponse = await fetch(`/api/projects/${projectId}/investments`);
        if (investmentsResponse.ok) {
          const investmentsData = await investmentsResponse.json();
          setInvestments(investmentsData);
        }
        
        // Fetch transactions
        const transactionsResponse = await fetch(`/api/projects/${projectId}/transactions`);
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message || 'Failed to load financial data');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);
  
  // Calculate financial metrics whenever the data changes
  useEffect(() => {
    if (!project) return;
    
    // Calculate loan metrics
    const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalLoansRemaining = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    
    // Calculate investment metrics
    const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
    
    // Calculate expense and revenue from transactions
    const totalExpenses = transactions
      .filter(t => [
        TransactionType.EXPENSE, 
        TransactionType.PRINCIPAL_PAYMENT,
        TransactionType.INTEREST_PAYMENT
      ].includes(t.type as TransactionType))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRevenue = transactions
      .filter(t => [
        TransactionType.REVENUE,
        TransactionType.DEPOSIT
      ].includes(t.type as TransactionType))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate ROI (Return on Investment)
    const totalInvestmentReturns = investments.reduce((sum, inv) => sum + inv.actualReturns, 0);
    const roi = totalInvested > 0 ? (totalInvestmentReturns / totalInvested) * 100 : 0;
    
    // Calculate Loan to Value (LTV) ratio
    const loanToValue = project.totalBudget > 0 ? (totalLoansRemaining / project.totalBudget) * 100 : 0;
    
    // Cash Flow
    const cashFlow = totalRevenue - totalExpenses;
    
    // Debt Coverage Ratio
    const annualDebtService = loans.reduce((sum, loan) => sum + (loan.totalInterestPaid + loan.totalPrincipalPaid), 0);
    const debtCoverageRatio = annualDebtService > 0 ? totalRevenue / annualDebtService : 0;
    
    setMetrics({
      totalInvested,
      totalLoans,
      totalLoansRemaining,
      totalExpenses,
      totalRevenue,
      cashFlow,
      roi,
      loanToValue,
      debtCoverageRatio
    });
  }, [project, loans, investments, transactions]);
  
  // Filter transactions based on selected time period
  const getFilteredTransactions = () => {
    if (selectedTimePeriod === 'all') {
      return transactions;
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimePeriod) {
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case '6months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };
  
  // Prepare data for the cash flow chart
  const getCashFlowChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    // Group transactions by month
    const transactionsByMonth: { [key: string]: { expenses: number, revenue: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!transactionsByMonth[monthYear]) {
        transactionsByMonth[monthYear] = { expenses: 0, revenue: 0 };
      }
      
      const isExpense = [
        TransactionType.EXPENSE, 
        TransactionType.PRINCIPAL_PAYMENT,
        TransactionType.INTEREST_PAYMENT
      ].includes(transaction.type as TransactionType);
      
      const isRevenue = [
        TransactionType.REVENUE,
        TransactionType.DEPOSIT
      ].includes(transaction.type as TransactionType);
      
      if (isExpense) {
        transactionsByMonth[monthYear].expenses += transaction.amount;
      } else if (isRevenue) {
        transactionsByMonth[monthYear].revenue += transaction.amount;
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(transactionsByMonth).sort();
    
    // Format month labels
    const monthLabels = sortedMonths.map(monthYear => {
      const [year, month] = monthYear.split('-');
      return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
    });
    
    // Prepare data arrays
    const expenses = sortedMonths.map(month => transactionsByMonth[month].expenses);
    const revenues = sortedMonths.map(month => transactionsByMonth[month].revenue);
    const cashFlow = sortedMonths.map((month, i) => revenues[i] - expenses[i]);
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          backgroundColor: colors.greenLight,
          borderColor: colors.green,
          borderWidth: 2,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: colors.redLight,
          borderColor: colors.red,
          borderWidth: 2,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Cash Flow',
          data: cashFlow,
          backgroundColor: colors.blueLight,
          borderColor: colors.blue,
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }
      ]
    };
  };
  
  // Prepare data for the loan allocation pie chart
  const getLoanAllocationChartData = () => {
    const loansByType: { [key: string]: number } = {};
    
    loans.forEach(loan => {
      const type = loan.type;
      if (!loansByType[type]) {
        loansByType[type] = 0;
      }
      loansByType[type] += loan.amount;
    });
    
    return {
      labels: Object.keys(loansByType).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          data: Object.values(loansByType),
          backgroundColor: [
            colors.blue,
            colors.red,
            colors.green,
            colors.orange,
            colors.purple,
            colors.yellow
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare data for the investment allocation pie chart
  const getInvestmentAllocationChartData = () => {
    const investmentsByType: { [key: string]: number } = {};
    
    investments.forEach(investment => {
      const type = investment.type;
      if (!investmentsByType[type]) {
        investmentsByType[type] = 0;
      }
      investmentsByType[type] += investment.amount;
    });
    
    return {
      labels: Object.keys(investmentsByType).map(type => type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
      datasets: [
        {
          data: Object.values(investmentsByType),
          backgroundColor: [
            colors.green,
            colors.blue,
            colors.purple,
            colors.yellow,
            colors.orange
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare data for the investment ROI chart
  const getInvestmentROIChartData = () => {
    return {
      labels: investments.map(inv => inv.investorName),
      datasets: [
        {
          label: 'Expected ROI',
          data: investments.map(inv => inv.expectedROI),
          backgroundColor: colors.blueLight,
          borderColor: colors.blue,
          borderWidth: 1,
          barPercentage: 0.6
        },
        {
          label: 'Actual ROI',
          data: investments.map(inv => inv.actualROI),
          backgroundColor: colors.greenLight,
          borderColor: colors.green,
          borderWidth: 1,
          barPercentage: 0.6
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-3">
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Project Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard: {project?.name}</h1>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/projects/${projectId}/financial/loans/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" />
            Add Loan
          </Link>
          <Link
            href={`/dashboard/projects/${projectId}/financial/investments/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaPlus className="mr-2" />
            Add Investment
          </Link>
          <Link
            href={`/dashboard/projects/${projectId}/financial/transactions/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FaPlus className="mr-2" />
            Add Transaction
          </Link>
        </div>
      </div>
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <FaHandHoldingUsd className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalInvested)}</h3>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">ROI</p>
                <p className="text-sm font-medium">{formatPercentage(metrics.roi)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Investors</p>
                <p className="text-sm font-medium">{investments.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <FaMoneyBillWave className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Loans</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalLoans)}</h3>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-medium">{formatCurrency(metrics.totalLoansRemaining)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">LTV Ratio</p>
                <p className="text-sm font-medium">{formatPercentage(metrics.loanToValue)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <FaChartLine className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cash Flow</p>
              <h3 className={`text-xl font-bold ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.cashFlow)}
              </h3>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-sm font-medium">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expenses</p>
                <p className="text-sm font-medium">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cash Flow Chart */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Cash Flow Analysis</h2>
          <div className="inline-flex rounded-md shadow-sm">
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          {transactions.length > 0 ? (
            <Line 
              data={getCashFlowChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Revenue, Expenses & Cash Flow'
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Amount ($)'
                    },
                    beginAtZero: true
                  }
                }
              }} 
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transaction data available for this time period.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Loans and Investments Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Loan Allocation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Loan Allocation</h2>
          {loans.length > 0 ? (
            <div className="h-64">
              <Pie 
                data={getLoanAllocationChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Loan Types by Amount'
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No loan data available.</p>
              <Link
                href={`/dashboard/projects/${projectId}/financial/loans/new`}
                className="inline-flex items-center px-3 py-2 mt-4 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Add First Loan
              </Link>
            </div>
          )}
        </div>
        
        {/* Investment Allocation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Investment Allocation</h2>
          {investments.length > 0 ? (
            <div className="h-64">
              <Pie 
                data={getInvestmentAllocationChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Investment Types by Amount'
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No investment data available.</p>
              <Link
                href={`/dashboard/projects/${projectId}/financial/investments/new`}
                className="inline-flex items-center px-3 py-2 mt-4 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaPlus className="mr-2" />
                Add First Investment
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Investment ROI Chart */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Investment ROI Comparison</h2>
        <div className="bg-white rounded-lg shadow p-6">
          {investments.length > 0 ? (
            <Bar 
              data={getInvestmentROIChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Expected vs. Actual ROI by Investor'
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Investor'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'ROI (%)'
                    },
                    beginAtZero: true
                  }
                }
              }} 
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No investment data available for ROI comparison.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          <Link
            href={`/dashboard/projects/${projectId}/financial/transactions`}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View All <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.slice(0, 5).map((transaction) => (
                <li key={transaction._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {transaction.description}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          [TransactionType.REVENUE, TransactionType.DEPOSIT, TransactionType.DIVIDEND].includes(transaction.type as TransactionType)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <FaDollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transaction data available.</p>
              <Link
                href={`/dashboard/projects/${projectId}/financial/transactions/new`}
                className="inline-flex items-center px-3 py-2 mt-4 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FaPlus className="mr-2" />
                Add First Transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 