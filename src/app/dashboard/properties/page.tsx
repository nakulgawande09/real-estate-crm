'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, subDays } from 'date-fns';
import { FaSearch, FaFilter, FaHome, FaBuilding, FaPlusCircle, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCalendarAlt, FaTag, FaSortAmountDown, FaSortAmountUp, FaChartLine, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
  yearBuilt: number;
  lotSize?: number; // in sq ft
  parking: number;
  amenities: string[];
}

interface Property {
  id: string;
  title: string;
  description: string;
  type: 'SINGLE_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'MULTI_FAMILY' | 'LAND' | 'COMMERCIAL';
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'OFF_MARKET' | 'UNDER_RENOVATION';
  price: number;
  address: PropertyAddress;
  details: PropertyDetails;
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  listedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tags: string[];
}

export default function PropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('');
  const [sortField, setSortField] = useState<'price' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Property metrics
  const [totalProperties, setTotalProperties] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [soldThisMonth, setSoldThisMonth] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);

  useEffect(() => {
    // Mock data for properties
    const mockProperties: Property[] = [
      {
        id: 'prop1',
        title: 'Luxury Suite 1201',
        description: 'Stunning luxury suite with panoramic views of the city skyline. This elegant property features high-end finishes and state-of-the-art appliances.',
        type: 'CONDO',
        status: 'ACTIVE',
        price: 1250000,
        address: {
          street: '123 Skyline Drive, PH 1201',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        details: {
          bedrooms: 3,
          bathrooms: 2.5,
          area: 2100,
          yearBuilt: 2018,
          parking: 2,
          amenities: ['Pool', 'Gym', 'Concierge', 'Rooftop Terrace', 'Smart Home']
        },
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bHV4dXJ5JTIwY29uZG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: true,
        createdAt: subDays(new Date(), 30).toISOString(),
        updatedAt: subDays(new Date(), 5).toISOString(),
        listedBy: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        tags: ['luxury', 'view', 'modern']
      },
      {
        id: 'prop2',
        title: 'Riverfront Heights Apartment',
        description: 'Spacious apartment overlooking the river with floor-to-ceiling windows offering spectacular views and abundant natural light.',
        type: 'CONDO',
        status: 'PENDING',
        price: 890000,
        address: {
          street: '456 River Blvd, Apt 703',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        details: {
          bedrooms: 2,
          bathrooms: 2,
          area: 1800,
          yearBuilt: 2015,
          parking: 1,
          amenities: ['Doorman', 'Elevator', 'In-unit Laundry', 'Balcony']
        },
        images: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJpdmVyZnJvbnQlMjBhcGFydG1lbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: false,
        createdAt: subDays(new Date(), 60).toISOString(),
        updatedAt: subDays(new Date(), 2).toISOString(),
        listedBy: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        tags: ['river-view', 'spacious', 'natural-light']
      },
      {
        id: 'prop3',
        title: 'Villa 101',
        description: 'Elegant Mediterranean-style villa with private pool and landscaped gardens in an exclusive gated community.',
        type: 'SINGLE_FAMILY',
        status: 'ACTIVE',
        price: 2350000,
        address: {
          street: '101 Palm Avenue',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139',
          country: 'USA'
        },
        details: {
          bedrooms: 5,
          bathrooms: 4.5,
          area: 4200,
          yearBuilt: 2010,
          lotSize: 12000,
          parking: 3,
          amenities: ['Private Pool', 'Garden', 'Security System', 'Wine Cellar', 'Outdoor Kitchen']
        },
        images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: true,
        createdAt: subDays(new Date(), 90).toISOString(),
        updatedAt: subDays(new Date(), 15).toISOString(),
        listedBy: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        tags: ['villa', 'pool', 'gated-community', 'luxury']
      },
      {
        id: 'prop4',
        title: 'Downtown Loft 305',
        description: 'Industrial-style loft in trendy downtown area with exposed brick walls, high ceilings, and original hardwood floors.',
        type: 'CONDO',
        status: 'SOLD',
        price: 725000,
        address: {
          street: '305 Arts District',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90013',
          country: 'USA'
        },
        details: {
          bedrooms: 1,
          bathrooms: 1.5,
          area: 1500,
          yearBuilt: 1935,
          parking: 1,
          amenities: ['Exposed Brick', 'High Ceilings', 'Original Hardwood', 'Freight Elevator']
        },
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGxvZnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: false,
        createdAt: subDays(new Date(), 120).toISOString(),
        updatedAt: subDays(new Date(), 5).toISOString(),
        listedBy: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        tags: ['loft', 'industrial', 'downtown', 'historic']
      },
      {
        id: 'prop5',
        title: 'Garden Terrace 2B',
        description: 'Modern townhouse with private garden terrace, open concept living, and premium finishes throughout.',
        type: 'TOWNHOUSE',
        status: 'ACTIVE',
        price: 875000,
        address: {
          street: '27 Garden Row, Unit 2B',
          city: 'Boston',
          state: 'MA',
          zipCode: '02116',
          country: 'USA'
        },
        details: {
          bedrooms: 3,
          bathrooms: 2.5,
          area: 2300,
          yearBuilt: 2020,
          parking: 1,
          amenities: ['Private Terrace', 'Smart Home', 'Central Air', 'Storage Unit']
        },
        images: ['https://images.unsplash.com/photo-1600607687126-8a3414349a51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRvd25ob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'],
        featured: true,
        createdAt: subDays(new Date(), 15).toISOString(),
        updatedAt: subDays(new Date(), 2).toISOString(),
        listedBy: {
          id: 'user3',
          name: 'Mark Wilson',
          email: 'mark@example.com',
          role: 'Admin'
        },
        tags: ['modern', 'terrace', 'new-construction']
      },
      {
        id: 'prop6',
        title: 'Skyline Tower 1501',
        description: 'Corner unit in prestigious Skyline Tower with 360-degree views, premium finishes, and full-service amenities.',
        type: 'CONDO',
        status: 'SOLD',
        price: 1650000,
        address: {
          street: '100 Skyline Drive, Unit 1501',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        },
        details: {
          bedrooms: 3,
          bathrooms: 3,
          area: 2200,
          yearBuilt: 2017,
          parking: 2,
          amenities: ['Concierge', 'Pool', 'Gym', 'Pet Spa', 'Business Center']
        },
        images: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwY29uZG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: false,
        createdAt: subDays(new Date(), 180).toISOString(),
        updatedAt: subDays(new Date(), 10).toISOString(),
        listedBy: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        tags: ['corner-unit', 'views', 'luxury']
      },
      {
        id: 'prop7',
        title: 'Harbor View 801',
        description: 'Waterfront property with direct harbor views, private boat slip, and recently renovated interior.',
        type: 'CONDO',
        status: 'ACTIVE',
        price: 1120000,
        address: {
          street: '801 Harbor Drive',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          country: 'USA'
        },
        details: {
          bedrooms: 2,
          bathrooms: 2,
          area: 1750,
          yearBuilt: 2005,
          parking: 1,
          amenities: ['Boat Slip', 'Balcony', 'Building Security', 'Storage']
        },
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwYXBhcnRtZW50JTIwd2F0ZXJmcm9udHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'],
        featured: true,
        createdAt: subDays(new Date(), 45).toISOString(),
        updatedAt: subDays(new Date(), 3).toISOString(),
        listedBy: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Agent'
        },
        tags: ['waterfront', 'boat-slip', 'renovated']
      },
      {
        id: 'prop8',
        title: 'Oakwood Estates',
        description: 'Majestic estate on expansive lot with mature oak trees, custom finishes, and resort-style backyard.',
        type: 'SINGLE_FAMILY',
        status: 'UNDER_RENOVATION',
        price: 3200000,
        address: {
          street: '55 Oakwood Lane',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75205',
          country: 'USA'
        },
        details: {
          bedrooms: 6,
          bathrooms: 5.5,
          area: 6500,
          yearBuilt: 1995,
          lotSize: 28000,
          parking: 4,
          amenities: ['Pool', 'Hot Tub', 'Wine Cellar', 'Home Theater', 'Guest House']
        },
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'],
        featured: true,
        createdAt: subDays(new Date(), 60).toISOString(),
        updatedAt: new Date().toISOString(),
        listedBy: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'CEO'
        },
        tags: ['estate', 'luxury', 'large-lot']
      }
    ];

    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
    
    // Calculate property metrics
    setTotalProperties(mockProperties.length);
    
    const active = mockProperties.filter(prop => prop.status === 'ACTIVE').length;
    setActiveListings(active);
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const soldThisMonthCount = mockProperties.filter(prop => 
      prop.status === 'SOLD' && 
      new Date(prop.updatedAt) >= firstDayOfMonth
    ).length;
    setSoldThisMonth(soldThisMonthCount);
    
    const avgPrice = mockProperties.reduce((sum, prop) => sum + prop.price, 0) / mockProperties.length;
    setAveragePrice(avgPrice);
    
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...properties];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.address.street.toLowerCase().includes(searchLower) ||
        property.address.city.toLowerCase().includes(searchLower) ||
        property.address.state.toLowerCase().includes(searchLower) ||
        property.address.zipCode.includes(search) ||
        property.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      result = result.filter(property => property.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(property => property.status === statusFilter);
    }
    
    // Apply price range filter
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      result = result.filter(property => 
        property.price >= min && (max ? property.price <= max : true)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'price') {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
    
    setFilteredProperties(result);
  }, [properties, search, typeFilter, statusFilter, priceRangeFilter, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'OFF_MARKET':
        return 'bg-gray-100 text-gray-800';
      case 'UNDER_RENOVATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'SINGLE_FAMILY':
        return <FaHome className="text-indigo-500" />;
      case 'CONDO':
        return <FaBuilding className="text-blue-500" />;
      case 'TOWNHOUSE':
        return <FaHome className="text-green-500" />;
      case 'MULTI_FAMILY':
        return <FaBuilding className="text-purple-500" />;
      case 'LAND':
        return <FaMapMarkerAlt className="text-yellow-500" />;
      case 'COMMERCIAL':
        return <FaBuilding className="text-red-500" />;
      default:
        return <FaHome className="text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <button
          onClick={() => {/* Add property functionality */}}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlusCircle className="mr-2" />
          Add Property
        </button>
      </div>

      {/* Property Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
            <FaHome className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
          <p className="text-xs text-gray-500 mt-1">All properties in database</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
            <FaTag className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
          <p className="text-xs text-gray-500 mt-1">Currently on market</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Sold This Month</h3>
            <FaCalendarAlt className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{soldThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">Properties sold this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
            <FaChartLine className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(averagePrice)}</p>
          <p className="text-xs text-gray-500 mt-1">Across all properties</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="SINGLE_FAMILY">Single Family</option>
            <option value="CONDO">Condo</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="MULTI_FAMILY">Multi-Family</option>
            <option value="LAND">Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
            <option value="OFF_MARKET">Off Market</option>
            <option value="UNDER_RENOVATION">Under Renovation</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={priceRangeFilter}
            onChange={(e) => setPriceRangeFilter(e.target.value)}
          >
            <option value="">All Prices</option>
            <option value="0-500000">Under $500K</option>
            <option value="500000-1000000">$500K - $1M</option>
            <option value="1000000-2000000">$1M - $2M</option>
            <option value="2000000-5000000">$2M - $5M</option>
            <option value="5000000-">$5M+</option>
          </select>
        </div>
      </div>

      {/* Properties Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200 relative">
              {property.featured && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs py-1 px-2 rounded-md z-10">
                  Featured
                </div>
              )}
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                  {property.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-xl font-bold text-indigo-600 mb-2">
                {formatCurrency(property.price)}
              </div>
              
              <div className="text-sm text-gray-600 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                <span className="truncate">{property.address.street}, {property.address.city}, {property.address.state}</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-gray-600">
                  <FaBed className="mr-1" /> <span className="text-sm mr-3">{property.details.bedrooms}</span>
                  <FaBath className="mr-1" /> <span className="text-sm mr-3">{property.details.bathrooms}</span>
                  <FaRulerCombined className="mr-1" /> <span className="text-sm">{property.details.area.toLocaleString()} sqft</span>
                </div>
                <div className="flex items-center">
                  {getPropertyTypeIcon(property.type)}
                  <span className="text-xs text-gray-600 ml-1">{property.type.replace('_', ' ')}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{property.description}</p>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Listed: {formatDate(property.createdAt)}
                </div>
                <div className="flex space-x-2">
                  <button 
                    title="View property"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FaEye />
                  </button>
                  <button 
                    title="Edit property"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    title="Delete property"
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <FaHome className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
} 