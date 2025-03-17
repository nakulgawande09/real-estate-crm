'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { format, subDays } from 'date-fns';
import { FaSearch, FaFilter, FaUserPlus, FaPhone, FaEnvelope, FaEllipsisH, FaStar, FaRegStar, FaChartLine, FaTemperatureHigh, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

export const runtime = 'edge';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: 'WEBSITE' | 'REFERRAL' | 'COLD_CALL' | 'OPEN_HOUSE' | 'SOCIAL_MEDIA' | 'OTHER';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  score: number; // 0-100 lead score
  temperature: 'HOT' | 'WARM' | 'COLD';
  notes: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  lastContactedAt: string;
  propertyInterests: {
    propertyType: string;
    budget: {
      min: number;
      max: number;
    };
    location: string;
    preferredMoveInDate?: string;
  };
  tags: string[];
}

function LeadsContent() {
  const { data: session } = useSession();
  const rawSearchParams = useSearchParams();
  const searchParams = use(rawSearchParams);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'lastContactedAt' | 'score'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Lead metrics
  const [totalLeads, setTotalLeads] = useState(0);
  const [newLeadsToday, setNewLeadsToday] = useState(0);
  const [hotLeads, setHotLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    // Mock data for leads
    const mockLeads: Lead[] = [
      {
        id: 'lead1',
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'robert.miller@example.com',
        phone: '+1 555-123-4567',
        source: 'WEBSITE',
        status: 'QUALIFIED',
        score: 85,
        temperature: 'HOT',
        notes: 'Interested in investment properties in downtown area. Has budget of $1-2M.',
        assignedTo: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        createdAt: subDays(new Date(), 5).toISOString(),
        lastContactedAt: subDays(new Date(), 1).toISOString(),
        propertyInterests: {
          propertyType: 'Commercial',
          budget: {
            min: 1000000,
            max: 2000000
          },
          location: 'Downtown'
        },
        tags: ['investor', 'high-budget', 'commercial']
      },
      {
        id: 'lead2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 555-987-6543',
        source: 'REFERRAL',
        status: 'CONTACTED',
        score: 65,
        temperature: 'WARM',
        notes: 'Looking for a family home in suburbs. Referred by Michael Chen.',
        assignedTo: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        createdAt: subDays(new Date(), 2).toISOString(),
        lastContactedAt: subDays(new Date(), 1).toISOString(),
        propertyInterests: {
          propertyType: 'Residential',
          budget: {
            min: 500000,
            max: 750000
          },
          location: 'Suburbs',
          preferredMoveInDate: format(subDays(new Date(), -60), 'yyyy-MM-dd')
        },
        tags: ['family', 'residential', 'referral']
      },
      {
        id: 'lead3',
        firstName: 'David',
        lastName: 'Wong',
        email: 'david.wong@example.com',
        phone: '+1 555-345-6789',
        source: 'OPEN_HOUSE',
        status: 'NEW',
        score: 45,
        temperature: 'WARM',
        notes: 'Attended open house for Garden Terrace. Showed interest but not ready to commit yet.',
        assignedTo: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        createdAt: new Date().toISOString(), // Today
        lastContactedAt: new Date().toISOString(),
        propertyInterests: {
          propertyType: 'Condo',
          budget: {
            min: 300000,
            max: 450000
          },
          location: 'Garden Terrace'
        },
        tags: ['open-house', 'first-time-buyer']
      },
      {
        id: 'lead4',
        firstName: 'Emily',
        lastName: 'Taylor',
        email: 'emily.taylor@example.com',
        phone: '+1 555-234-5678',
        source: 'SOCIAL_MEDIA',
        status: 'PROPOSAL',
        score: 78,
        temperature: 'HOT',
        notes: 'Interested in Downtown Loft 305. Proposal sent for financing options.',
        assignedTo: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        createdAt: subDays(new Date(), 7).toISOString(),
        lastContactedAt: subDays(new Date(), 1).toISOString(),
        propertyInterests: {
          propertyType: 'Loft',
          budget: {
            min: 600000,
            max: 800000
          },
          location: 'Downtown'
        },
        tags: ['loft', 'urban', 'financing']
      },
      {
        id: 'lead5',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@example.com',
        phone: '+1 555-876-5432',
        source: 'COLD_CALL',
        status: 'CLOSED_LOST',
        score: 20,
        temperature: 'COLD',
        notes: 'Initial interest but decided to go with another agency.',
        assignedTo: {
          id: 'user3',
          name: 'Mark Wilson',
          email: 'mark@example.com',
          role: 'Admin'
        },
        createdAt: subDays(new Date(), 30).toISOString(),
        lastContactedAt: subDays(new Date(), 10).toISOString(),
        propertyInterests: {
          propertyType: 'Residential',
          budget: {
            min: 400000,
            max: 500000
          },
          location: 'Suburbs'
        },
        tags: ['cold-call', 'lost-opportunity']
      },
      {
        id: 'lead6',
        firstName: 'Lisa',
        lastName: 'Garcia',
        email: 'lisa.garcia@example.com',
        phone: '+1 555-456-7890',
        source: 'WEBSITE',
        status: 'CLOSED_WON',
        score: 90,
        temperature: 'HOT',
        notes: 'Successfully closed on Skyline Tower property.',
        assignedTo: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        createdAt: subDays(new Date(), 45).toISOString(),
        lastContactedAt: subDays(new Date(), 5).toISOString(),
        propertyInterests: {
          propertyType: 'Apartment',
          budget: {
            min: 700000,
            max: 900000
          },
          location: 'Skyline Tower'
        },
        tags: ['repeat-client', 'success-story']
      },
      {
        id: 'lead7',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '+1 555-567-8901',
        source: 'REFERRAL',
        status: 'NEGOTIATION',
        score: 82,
        temperature: 'HOT',
        notes: 'In final negotiation stages for Riverfront Heights property.',
        assignedTo: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        createdAt: subDays(new Date(), 15).toISOString(),
        lastContactedAt: subDays(new Date(), 1).toISOString(),
        propertyInterests: {
          propertyType: 'Condo',
          budget: {
            min: 800000,
            max: 1200000
          },
          location: 'Riverfront'
        },
        tags: ['luxury', 'negotiation', 'riverfront']
      }
    ];

    setLeads(mockLeads);
    setFilteredLeads(mockLeads);
    
    // Calculate lead metrics
    setTotalLeads(mockLeads.length);
    
    const today = new Date().toISOString().split('T')[0];
    const newToday = mockLeads.filter(lead => 
      lead.createdAt.startsWith(today)
    ).length;
    setNewLeadsToday(newToday);
    
    const hotLeadsCount = mockLeads.filter(lead => 
      lead.temperature === 'HOT' && 
      (lead.status !== 'CLOSED_WON' && lead.status !== 'CLOSED_LOST')
    ).length;
    setHotLeads(hotLeadsCount);
    
    const closedWon = mockLeads.filter(lead => lead.status === 'CLOSED_WON').length;
    const closedTotal = mockLeads.filter(lead => 
      lead.status === 'CLOSED_WON' || lead.status === 'CLOSED_LOST'
    ).length;
    
    const convRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;
    setConversionRate(convRate);
    
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...leads];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(lead => 
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone.includes(search) ||
        lead.notes.toLowerCase().includes(searchLower) ||
        lead.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Apply source filter
    if (sourceFilter) {
      result = result.filter(lead => lead.source === sourceFilter);
    }
    
    // Apply temperature filter
    if (temperatureFilter) {
      result = result.filter(lead => lead.temperature === temperatureFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortField === 'lastContactedAt') {
        return sortDirection === 'asc' 
          ? new Date(a.lastContactedAt).getTime() - new Date(b.lastContactedAt).getTime()
          : new Date(b.lastContactedAt).getTime() - new Date(a.lastContactedAt).getTime();
      } else if (sortField === 'score') {
        return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
      }
      return 0;
    });
    
    setFilteredLeads(result);
  }, [leads, search, statusFilter, sourceFilter, temperatureFilter, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'CONTACTED':
        return 'bg-purple-100 text-purple-800';
      case 'QUALIFIED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROPOSAL':
        return 'bg-indigo-100 text-indigo-800';
      case 'NEGOTIATION':
        return 'bg-orange-100 text-orange-800';
      case 'CLOSED_WON':
        return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'WEBSITE':
        return <span className="text-blue-500">🌐</span>;
      case 'REFERRAL':
        return <span className="text-green-500">👥</span>;
      case 'COLD_CALL':
        return <span className="text-indigo-500">📞</span>;
      case 'OPEN_HOUSE':
        return <span className="text-yellow-500">🏠</span>;
      case 'SOCIAL_MEDIA':
        return <span className="text-pink-500">📱</span>;
      default:
        return <span className="text-gray-500">❓</span>;
    }
  };

  const getTemperatureBadge = (temperature: string) => {
    switch (temperature) {
      case 'HOT':
        return (
          <span className="flex items-center text-red-600">
            <FaTemperatureHigh className="mr-1" />
            HOT
          </span>
        );
      case 'WARM':
        return (
          <span className="flex items-center text-yellow-600">
            <FaTemperatureHigh className="mr-1" />
            WARM
          </span>
        );
      case 'COLD':
        return (
          <span className="flex items-center text-blue-600">
            <FaTemperatureHigh className="mr-1" />
            COLD
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-600">
            <FaTemperatureHigh className="mr-1" />
            UNKNOWN
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 20);
    const hasHalfStar = score % 20 >= 10;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
        <button
          onClick={() => {/* Add lead functionality */}}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Add Lead
        </button>
      </div>

      {/* Lead Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <FaChartLine className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
          <p className="text-xs text-gray-500 mt-1">All leads in database</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">New Today</h3>
            <FaUserPlus className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{newLeadsToday}</p>
          <p className="text-xs text-gray-500 mt-1">Leads added today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Hot Leads</h3>
            <FaTemperatureHigh className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{hotLeads}</p>
          <p className="text-xs text-gray-500 mt-1">Active high-potential leads</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <FaChartLine className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Of closed deals</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CLOSED_WON">Closed Won</option>
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="COLD_CALL">Cold Call</option>
            <option value="OPEN_HOUSE">Open House</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
          >
            <option value="">All Temperatures</option>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="COLD">Cold</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('score');
                    setSortDirection(sortField === 'score' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Score
                    {sortField === 'score' && (
                      sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('createdAt');
                    setSortDirection(sortField === 'createdAt' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('lastContactedAt');
                    setSortDirection(sortField === 'lastContactedAt' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Last Contact
                    {sortField === 'lastContactedAt' && (
                      sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FaEnvelope className="mr-1 text-xs" /> {lead.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FaPhone className="mr-1 text-xs" /> {lead.phone}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {lead.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getSourceIcon(lead.source)}
                      <span className="text-sm text-gray-700">{lead.source.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{lead.score}/100</span>
                      {renderStars(lead.score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTemperatureBadge(lead.temperature)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.lastContactedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        title="Call lead"
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaPhone />
                      </button>
                      <button 
                        title="Email lead"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEnvelope />
                      </button>
                      <button 
                        title="More options"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FaEllipsisH />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
} 