
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
  CheckCircle, 
  Clock, 
  Archive 
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
  proposed: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusIcons = {
  proposed: Clock,
  in_progress: FileCode,
  completed: CheckCircle,
  archived: Archive,
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
          <Button as={Link} to="/pocs/create" className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            New POC
          </Button>
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
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
              <Button as={Link} to="/pocs/create" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create your first POC
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPocs.map((poc) => {
            const StatusIcon = statusIcons[poc.status];
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
                          className={statusColors[poc.status]}
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
