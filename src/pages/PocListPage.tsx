import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPocs, Poc, PocStatus } from '../services/api';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileCode, 
  Plus, 
  Search, 
  Clock, 
  Users,
  UserCheck,
  Calendar,
  Loader2,
  Clock4,
  CheckCircle2,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  'Account Manager coordinated with Tech Lead': 'bg-purple-100 text-purple-700 border-purple-200',
  'Tech Lead reached the customer': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Tech Lead assigned engineering team': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Kickoff is done & scopes defined': 'bg-pink-100 text-pink-700 border-pink-200',
  'In progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Customer pending': 'bg-orange-100 text-orange-700 border-orange-200',
  'Taqniyat pending': 'bg-teal-100 text-teal-700 border-teal-200',
  'Done': 'bg-green-100 text-green-700 border-green-200',
  'Failed': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons = {
  'Account Manager coordinated with Tech Lead': UserCheck,
  'Tech Lead reached the customer': Users,
  'Tech Lead assigned engineering team': Users,
  'Kickoff is done & scopes defined': Calendar,
  'In progress': Loader2,
  'Customer pending': Clock4,
  'Taqniyat pending': Clock4,
  'Done': CheckCircle2,
  'Failed': X,
};

const PocListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [pocs, setPocs] = useState<Poc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPocs = async () => {
      try {
        const data = await getPocs();
        setPocs(data);
      } catch (error) {
        console.error('Error fetching POCs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPocs();
  }, []);

  const filteredPocs = pocs.filter(poc => {
    const matchesSearch = poc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          poc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          poc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || poc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Proof of Concepts</h1>
          <p className="text-gray-500">Manage and track all POC projects</p>
        </div>
        {hasPermission('poc', 'create') && (
          <Link to="/pocs/create">
            <Button className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              New POC
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search POCs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Account Manager coordinated with Tech Lead">AM coordinated w/ Tech Lead</SelectItem>
                  <SelectItem value="Tech Lead reached the customer">Tech Lead reached customer</SelectItem>
                  <SelectItem value="Tech Lead assigned engineering team">Engineering team assigned</SelectItem>
                  <SelectItem value="Kickoff is done & scopes defined">Kickoff & scope complete</SelectItem>
                  <SelectItem value="In progress">In Progress</SelectItem>
                  <SelectItem value="Customer pending">Customer pending</SelectItem>
                  <SelectItem value="Taqniyat pending">Taqniyat pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileCode className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No POCs found</h3>
            <p className="text-gray-500 text-center mt-2">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "No proof of concepts have been created yet"}
            </p>
            {hasPermission('poc', 'create') && (
              <Link to="/pocs/create">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first POC
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPocs.map((poc) => {
            const StatusIcon = statusIcons[poc.status] || Clock;
            return (
              <Link key={poc.id} to={`/pocs/${poc.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <StatusIcon className="h-5 w-5 text-gray-500" />
                          <h3 className="text-lg font-medium">{poc.title}</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                          {poc.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {poc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <Badge 
                          variant="outline" 
                          className={statusColors[poc.status] || 'bg-gray-100 text-gray-700 border-gray-200'}
                        >
                          {poc.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Updated {new Date(poc.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default PocListPage;
