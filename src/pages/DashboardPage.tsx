
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPocs, Poc } from '../services/api';
import AppLayout from '../components/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCode, CheckCircle, Clock, Archive } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const statusIcons = {
  proposed: Clock,
  in_progress: FileCode,
  completed: CheckCircle,
  archived: Archive,
};

const statusColors = {
  proposed: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-700 border-gray-200',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [pocs, setPocs] = useState<Poc[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  // Calculate status counts for chart
  const statusCounts = pocs.reduce((acc, poc) => {
    acc[poc.status] = (acc[poc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({ 
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '), 
    value: count 
  }));

  const CHART_COLORS = ['#FBBF24', '#3B82F6', '#10B981', '#9CA3AF'];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>POC Overview</CardTitle>
            <CardDescription>Current project status distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} POCs`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent POCs</CardTitle>
            <CardDescription>Your recently updated POCs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pocs.slice(0, 3).map((poc) => {
                const StatusIcon = statusIcons[poc.status];
                return (
                  <Link key={poc.id} to={`/pocs/${poc.id}`}>
                    <div className="p-4 transition-colors border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="w-5 h-5 text-gray-500" />
                          <div>
                            <h3 className="font-medium">{poc.title}</h3>
                            <p className="text-sm text-gray-500">
                              Updated {new Date(poc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={statusColors[poc.status]}
                        >
                          {poc.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
