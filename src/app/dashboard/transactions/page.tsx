'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, subDays } from 'date-fns';
import { FaSearch, FaFilter, FaFileDownload, FaSortAmountDown, FaSortAmountUp, FaDollarSign, FaArrowUp, FaArrowDown, FaChartLine, FaExchangeAlt, FaCalendarAlt, FaPercentage, FaMoneyBill } from 'react-icons/fa';
import Link from 'next/link';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

interface Transaction {
  id: string;
  date: string;
  type: 'SALE' | 'RESERVATION' | 'CANCELLATION' | 'PAYMENT' | 'REFUND';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  amount: number;
  propertyId: string;
  propertyName: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  paymentMethod: string;
  reference: string;
  isRecurring?: boolean;
  recurringPeriod?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Financial metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [recurringRevenue, setRecurringRevenue] = useState(0);
  const [avgTransactionValue, setAvgTransactionValue] = useState(0);
  const [transactionCountToday, setTransactionCountToday] = useState(0);
  const [monthlyTransactionChart, setMonthlyTransactionChart] = useState<ChartData | null>(null);
  const [transactionTypeChart, setTransactionTypeChart] = useState<ChartData | null>(null);
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState<ChartData | null>(null);
  const [paymentMethodChart, setPaymentMethodChart] = useState<ChartData | null>(null);

  useEffect(() => {
    // Mock data for transactions
    const mockTransactions: Transaction[] = [
      {
        id: 'trans1',
        date: '2024-03-15T10:30:00Z',
        type: 'SALE',
        status: 'COMPLETED',
        amount: 1225000,
        propertyId: 'prop1',
        propertyName: 'Luxury Suite 1201',
        customer: {
          id: 'cust1',
          name: 'John Thompson',
          email: 'john@example.com'
        },
        paymentMethod: 'MORTGAGE',
        reference: 'RH-2023-1201'
      },
      {
        id: 'trans2',
        date: '2024-03-14T15:45:00Z',
        type: 'RESERVATION',
        status: 'PENDING',
        amount: 25000,
        propertyId: 'prop2',
        propertyName: 'Luxury Suite 1202',
        customer: {
          id: 'cust2',
          name: 'Michael Chen',
          email: 'michael@example.com'
        },
        paymentMethod: 'WIRE_TRANSFER',
        reference: 'RH-2023-1202'
      },
      {
        id: 'trans3',
        date: '2024-03-13T09:15:00Z',
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 50000,
        propertyId: 'prop3',
        propertyName: 'Villa 101',
        customer: {
          id: 'cust3',
          name: 'Sarah Williams',
          email: 'sarah@example.com'
        },
        paymentMethod: 'BANK_TRANSFER',
        reference: 'OE-2023-101'
      },
      {
        id: 'trans4',
        date: '2024-03-10T11:20:00Z',
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 7500,
        propertyId: 'prop4',
        propertyName: 'Downtown Loft 305',
        customer: {
          id: 'cust4',
          name: 'Emily Johnson',
          email: 'emily@example.com'
        },
        paymentMethod: 'CREDIT_CARD',
        reference: 'DL-2023-305',
        isRecurring: true,
        recurringPeriod: 'MONTHLY'
      },
      {
        id: 'trans5',
        date: '2024-03-05T14:10:00Z',
        type: 'SALE',
        status: 'COMPLETED',
        amount: 845000,
        propertyId: 'prop5',
        propertyName: 'Garden Terrace 2B',
        customer: {
          id: 'cust5',
          name: 'David Wong',
          email: 'david@example.com'
        },
        paymentMethod: 'MORTGAGE',
        reference: 'GT-2023-2B'
      },
      {
        id: 'trans6',
        date: '2024-02-28T09:30:00Z',
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 12500,
        propertyId: 'prop6',
        propertyName: 'Skyline Tower 1501',
        customer: {
          id: 'cust6',
          name: 'Robert Martinez',
          email: 'robert@example.com'
        },
        paymentMethod: 'BANK_TRANSFER',
        reference: 'ST-2023-1501',
        isRecurring: true,
        recurringPeriod: 'QUARTERLY'
      },
      {
        id: 'trans7',
        date: '2024-02-20T16:45:00Z',
        type: 'RESERVATION',
        status: 'COMPLETED',
        amount: 15000,
        propertyId: 'prop7',
        propertyName: 'Harbor View 801',
        customer: {
          id: 'cust7',
          name: 'Jessica Kim',
          email: 'jessica@example.com'
        },
        paymentMethod: 'CREDIT_CARD',
        reference: 'HV-2023-801'
      },
      {
        id: 'trans8',
        date: new Date().toISOString(), // Today
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 5000,
        propertyId: 'prop4',
        propertyName: 'Downtown Loft 305',
        customer: {
          id: 'cust4',
          name: 'Emily Johnson',
          email: 'emily@example.com'
        },
        paymentMethod: 'CREDIT_CARD',
        reference: 'DL-2023-305-PAY',
        isRecurring: true,
        recurringPeriod: 'MONTHLY'
      },
      {
        id: 'trans9',
        date: subDays(new Date(), 1).toISOString(), // Yesterday
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 35000,
        propertyId: 'prop8',
        propertyName: 'Mountain View Estate',
        customer: {
          id: 'cust8',
          name: 'Thomas Wilson',
          email: 'thomas@example.com'
        },
        paymentMethod: 'BANK_TRANSFER',
        reference: 'MVE-2023-101',
        isRecurring: false
      },
      {
        id: 'trans10',
        date: subDays(new Date(), 2).toISOString(), // 2 days ago
        type: 'REFUND',
        status: 'COMPLETED',
        amount: 5000,
        propertyId: 'prop9',
        propertyName: 'Downtown Condo 508',
        customer: {
          id: 'cust9',
          name: 'Alexandra Brown',
          email: 'alex@example.com'
        },
        paymentMethod: 'CREDIT_CARD',
        reference: 'DC-2023-508-REF',
        isRecurring: false
      },
      {
        id: 'trans11',
        date: '2024-01-15T10:30:00Z',
        type: 'SALE',
        status: 'COMPLETED',
        amount: 925000,
        propertyId: 'prop10',
        propertyName: 'Seaside Villa',
        customer: {
          id: 'cust10',
          name: 'James Rodriguez',
          email: 'james@example.com'
        },
        paymentMethod: 'MORTGAGE',
        reference: 'SV-2024-101'
      },
      {
        id: 'trans12',
        date: '2024-01-20T14:15:00Z',
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 7500,
        propertyId: 'prop4',
        propertyName: 'Downtown Loft 305',
        customer: {
          id: 'cust4',
          name: 'Emily Johnson',
          email: 'emily@example.com'
        },
        paymentMethod: 'CREDIT_CARD',
        reference: 'DL-2024-305-JAN',
        isRecurring: true,
        recurringPeriod: 'MONTHLY'
      }
    ];

    setTransactions(mockTransactions);

    // Calculate financial metrics
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const lastMonth = subMonths(today, 1);
    const twoMonthsAgo = subMonths(today, 2);

    // Transactions today
    const transactionsToday = mockTransactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === todayStr);
    setTransactionCountToday(transactionsToday.length);

    // Current month transactions
    const currentMonthTransactions = mockTransactions.filter(t => 
      new Date(t.date) >= startOfMonth(today) && 
      new Date(t.date) <= endOfMonth(today) &&
      t.status === 'COMPLETED');
    
    // Last month transactions
    const lastMonthTransactions = mockTransactions.filter(t => 
      new Date(t.date) >= startOfMonth(lastMonth) && 
      new Date(t.date) <= endOfMonth(lastMonth) &&
      t.status === 'COMPLETED');
    
    // Two months ago transactions
    const twoMonthsAgoTransactions = mockTransactions.filter(t => 
      new Date(t.date) >= startOfMonth(twoMonthsAgo) && 
      new Date(t.date) <= endOfMonth(twoMonthsAgo) &&
      t.status === 'COMPLETED');

    // Calculate total revenue
    const currentMonthRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    setTotalRevenue(currentMonthRevenue);
    
    // Calculate revenue change percentage
    const revChange = lastMonthRevenue !== 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    setRevenueChange(revChange);

    // Calculate recurring revenue
    const recurringTransactions = mockTransactions.filter(t => t.isRecurring);
    const monthlyRecurring = recurringTransactions
      .filter(t => t.recurringPeriod === 'MONTHLY')
      .reduce((sum, t) => sum + t.amount, 0);
    const quarterlyRecurring = recurringTransactions
      .filter(t => t.recurringPeriod === 'QUARTERLY')
      .reduce((sum, t) => sum + (t.amount / 3), 0); // Divide by 3 to get monthly value
    const annualRecurring = recurringTransactions
      .filter(t => t.recurringPeriod === 'ANNUALLY')
      .reduce((sum, t) => sum + (t.amount / 12), 0); // Divide by 12 to get monthly value
    
    setRecurringRevenue(monthlyRecurring + quarterlyRecurring + annualRecurring);

    // Calculate average transaction value
    const completedTransactions = mockTransactions.filter(t => t.status === 'COMPLETED');
    const avgValue = completedTransactions.length > 0 
      ? completedTransactions.reduce((sum, t) => sum + t.amount, 0) / completedTransactions.length 
      : 0;
    setAvgTransactionValue(avgValue);

    // Prepare monthly transaction chart data
    const currentMonthDays = eachDayOfInterval({
      start: startOfMonth(today),
      end: today
    });

    // Get data for the last 3 months for trend
    const threeMonthsAgo = subMonths(today, 2);
    const months = [threeMonthsAgo, lastMonth, today];
    const monthNames = months.map(m => format(m, 'MMM yyyy'));
    
    const monthlyRevenueData = months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const monthTrans = mockTransactions.filter(t => 
        new Date(t.date) >= start && 
        new Date(t.date) <= end &&
        t.status === 'COMPLETED');
      return monthTrans.reduce((sum, t) => sum + t.amount, 0);
    });

    // Prepare daily revenue data with more visual appeal
    const dailyTotals = currentMonthDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = mockTransactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === dayStr && 
        t.status === 'COMPLETED');
      return dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    // Create a gradient for the bar chart
    setMonthlyTransactionChart({
      labels: currentMonthDays.map(day => format(day, 'MMM d')),
      datasets: [
        {
          label: 'Daily Revenue',
          data: dailyTotals,
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 10
        }
      ]
    });

    // Monthly Revenue Trend (Line Chart)
    const monthlyRevenueChart = {
      labels: monthNames,
      datasets: [
        {
          label: 'Monthly Revenue',
          data: monthlyRevenueData,
          fill: true,
          backgroundColor: 'rgba(66, 135, 245, 0.1)',
          borderColor: 'rgba(66, 135, 245, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(66, 135, 245, 1)',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    // Prepare transaction type chart data with better visuals
    const transactionTypes = [...new Set(mockTransactions.map(t => t.type))];
    const typeAmounts = transactionTypes.map(type => {
      const typeTransactions = mockTransactions.filter(t => 
        t.type === type && 
        t.status === 'COMPLETED');
      return typeTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const backgroundColors = [
      'rgba(66, 135, 245, 0.8)',
      'rgba(149, 76, 233, 0.8)',
      'rgba(237, 100, 166, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)'
    ];

    // Convert to doughnut chart with better visuals
    setTransactionTypeChart({
      labels: transactionTypes.map(type => type.charAt(0) + type.slice(1).toLowerCase()),
      datasets: [
        {
          label: 'Amount by Transaction Type',
          data: typeAmounts,
          backgroundColor: backgroundColors.slice(0, transactionTypes.length),
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 2,
          hoverOffset: 12
        }
      ]
    });

    // Generate payment method distribution
    const paymentMethods = [...new Set(mockTransactions.map(t => t.paymentMethod))];
    const paymentMethodAmounts = paymentMethods.map(method => {
      const methodTransactions = mockTransactions.filter(t => 
        t.paymentMethod === method && 
        t.status === 'COMPLETED');
      return methodTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const paymentMethodChart = {
      labels: paymentMethods.map(method => method.split('_').join(' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [
        {
          label: 'Amount by Payment Method',
          data: paymentMethodAmounts,
          backgroundColor: [
            'rgba(52, 211, 153, 0.8)',
            'rgba(79, 70, 229, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };

    setPaymentMethodChart(paymentMethodChart);
    setMonthlyRevenueChart(monthlyRevenueChart);
    setLoading(false);
    setTotalPages(3); // Mock total pages
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'bg-blue-100 text-blue-800';
      case 'RESERVATION':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLATION':
        return 'bg-red-100 text-red-800';
      case 'PAYMENT':
        return 'bg-green-100 text-green-800';
      case 'REFUND':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
  };

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportTransactions = () => {
    // Implement export logic here
  };

  // Chart options with improved styling
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Daily Revenue',
        color: '#111827',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + Number(value).toLocaleString();
          },
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Transaction Distribution',
        color: '#111827',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% ($${value.toLocaleString()})`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Revenue Trend',
        color: '#111827',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + Number(value).toLocaleString();
          },
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
        <button
          onClick={exportTransactions}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaFileDownload className="mr-2" />
          Export
        </button>
      </div>

      {/* Financial Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg shadow-sm p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-indigo-600">Total Revenue (This Month)</h3>
            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
              <FaDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <div className={`flex items-center ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueChange >= 0 ? <FaArrowUp className="h-3 w-3 mr-1" /> : <FaArrowDown className="h-3 w-3 mr-1" />}
              <span className="text-xs font-medium">{Math.abs(revenueChange).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last month</p>
        </div>

        {/* Recurring Revenue Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-600">Monthly Recurring Revenue</h3>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <FaCalendarAlt className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${recurringRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Stable monthly income</p>
        </div>

        {/* Average Transaction Value Card */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-sm p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-600">Avg Transaction Value</h3>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
              <FaMoneyBill className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${avgTransactionValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">All completed transactions</p>
        </div>

        {/* Today's Transactions Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-emerald-600">Today's Transactions</h3>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <FaExchangeAlt className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{transactionCountToday}</p>
          <p className="text-xs text-gray-500 mt-1">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Revenue Trend</h3>
          <div className="h-64 relative">
            {monthlyRevenueChart && (
              <Line 
                data={monthlyRevenueChart} 
                options={lineChartOptions}
              />
            )}
          </div>
        </div>

        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Daily Revenue (This Month)</h3>
          <div className="h-64 relative">
            {monthlyTransactionChart && (
              <Bar 
                data={monthlyTransactionChart} 
                options={barChartOptions}
              />
            )}
          </div>
        </div>

        {/* Transaction Types Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Transaction Types</h3>
          <div className="h-64 relative">
            {transactionTypeChart && (
              <Doughnut 
                data={transactionTypeChart} 
                options={pieChartOptions} 
              />
            )}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Methods</h3>
          <div className="h-64 relative">
            {paymentMethodChart && (
              <Pie 
                data={paymentMethodChart} 
                options={pieChartOptions} 
              />
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">All Transactions</h2>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>

          <select
            className="w-full md:w-48 pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="SALE">Sale</option>
            <option value="RESERVATION">Reservation</option>
            <option value="CANCELLATION">Cancellation</option>
            <option value="PAYMENT">Payment</option>
            <option value="REFUND">Refund</option>
          </select>

          <select
            className="w-full md:w-48 pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurring
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/dashboard/transactions/${transaction.id}`} className="text-blue-600 hover:text-blue-900">
                      {transaction.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.propertyName}</div>
                    <div className="text-sm text-gray-500">ID: {transaction.propertyId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.customer.name}</div>
                    <div className="text-sm text-gray-500">{transaction.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.isRecurring ? (
                      <div className="text-sm text-green-600 font-medium">
                        {transaction.recurringPeriod} ↻
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">—</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 