
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, Project } from '../services/api';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  FileBox,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Map project technologies to Tailwind colors
const technologyColors = {
  'switching': 'bg-blue-100 text-blue-800 border-blue-200',
  'routers': 'bg-purple-100 text-purple-800 border-purple-200',
  'security': 'bg-red-100 text-red-800 border-red-200',
  'wireless': 'bg-green-100 text-green-800 border-green-200',
  'firewall': 'bg-orange-100 text-orange-800 border-orange-200',
  'access points': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'webex communication': 'bg-teal-100 text-teal-800 border-teal-200',
  'ip phones': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'AppDynamics': 'bg-amber-100 text-amber-800 border-amber-200',
  'Splunk': 'bg-lime-100 text-lime-800 border-lime-200',
  'Webex Room Kits': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

// Map project statuses to Tailwind colors
const statusColors = {
  'Account Manager coordinated with Tech Lead': 'bg-blue-100 text-blue-700',
  'Teach Lead reach the customer': 'bg-amber-100 text-amber-700',
  'Tech Lead assigned engineering team': 'bg-indigo-100 text-indigo-700',
  'kickoff is done & scopes defined': 'bg-purple-100 text-purple-700',
  'in progress': 'bg-green-100 text-green-700',
  'customer pending': 'bg-orange-100 text-orange-700',
  'Taqniyat pending': 'bg-cyan-100 text-cyan-700',
  'done': 'bg-emerald-100 text-emerald-700',
  'failed': 'bg-red-100 text-red-700',
  'default': 'bg-gray-100 text-gray-700'
};

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const search = searchTerm.toLowerCase();
    return (
      project.title.toLowerCase().includes(search) ||
      project.technology.toLowerCase().includes(search) ||
      project.status.toLowerCase().includes(search) ||
      project.lead?.name.toLowerCase().includes(search) ||
      project.accountManager?.name.toLowerCase().includes(search) ||
      project.customer?.name.toLowerCase().includes(search)
    );
  });

  const getTechnologyColor = (technology: string) => {
    return technologyColors[technology as keyof typeof technologyColors] || technologyColors.default;
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.default;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-gray-500">Manage and track all active projects</p>
          </div>
          {hasPermission('project', 'create') && (
            <Button onClick={() => navigate('/projects/create')} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FileBox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No projects found</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? 'Try adjusting your search term' : 'Get started by creating a new project'}
                </p>
                {!searchTerm && hasPermission('project', 'create') && (
                  <Button onClick={() => navigate('/projects/create')} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Technology</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Account Manager</TableHead>
                      <TableHead>Timeline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow 
                        key={project.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-400" />
                            {project.customer?.name || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTechnologyColor(project.technology)}>
                            {project.technology}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            {project.lead?.name || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {project.accountManager?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {format(new Date(project.startDate), 'MMM d, yyyy')}
                              {project.endDate ? ` - ${format(new Date(project.endDate), 'MMM d, yyyy')}` : ' - Present'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProjectListPage;
