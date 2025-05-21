
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProject, addComment, updateProject, Project, ProjectStatus } from '../services/api';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Users,
  User, 
  Building,
  Calendar,
  CalendarClock,
  FileCode
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { format } from 'date-fns';

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

// Project status options
const PROJECT_STATUSES: ProjectStatus[] = [
  'Account Manager coordinated with Tech Lead',
  'Teach Lead reach the customer',
  'Tech Lead assigned engineering team',
  'kickoff is done & scopes defined',
  'in progress',
  'customer pending',
  'Taqniyat pending',
  'done',
  'failed',
];

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [isEndDateUpdating, setIsEndDateUpdating] = useState(false);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getProject(id);
      setProject(data);
      
      // Format end date for input if available
      if (data?.endDate) {
        const formattedDate = format(new Date(data.endDate), "yyyy-MM-dd");
        setEndDate(formattedDate);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !id || newStatus === project.status) return;
    
    try {
      setStatusUpdating(true);
      const updated = await updateProject(id, { status: newStatus });
      if (updated) {
        setProject(updated);
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !project || !user) return;
    
    try {
      setSubmitting(true);
      const newComment = await addComment(project.id, commentText, user.id, 'project');
      
      if (newComment && project) {
        setProject({
          ...project,
          comments: [...project.comments, newComment]
        });
        setCommentText('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndDateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !id) return;
    
    try {
      setIsEndDateUpdating(true);
      const updated = await updateProject(id, { 
        endDate: endDate ? new Date(endDate).toISOString() : undefined 
      });
      if (updated) {
        setProject(updated);
        toast.success('End date updated successfully');
      }
    } catch (error) {
      console.error('Error updating end date:', error);
      toast.error('Failed to update end date');
    } finally {
      setIsEndDateUpdating(false);
    }
  };

  const getTechnologyColor = (technology: string) => {
    return technologyColors[technology as keyof typeof technologyColors] || technologyColors.default;
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.default;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-gray-500 mb-6">
            The project you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center mb-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            <p className="text-gray-500">
              Created on {format(new Date(project.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          {hasPermission('project', 'edit') && (
            <Button onClick={() => navigate(`/projects/${project.id}/edit`)} className="mt-4 sm:mt-0">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="flex items-center mt-1">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{project.customer?.name || 'Unknown'}</span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Technology</p>
                  <p className="mt-1">
                    <Badge variant="outline" className={getTechnologyColor(project.technology)}>
                      {project.technology}
                    </Badge>
                  </p>
                </div>
                
                <div className="col-span-full mt-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">Timeline</p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        Started: <span className="font-medium">{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                      </span>
                    </div>
                    
                    {project.endDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          Expected completion: <span className="font-medium">{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {project.pocId && (
                  <div className="col-span-full mt-2">
                    <p className="text-sm font-medium text-gray-500">Origin</p>
                    <p className="flex items-center mt-1">
                      <FileCode className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        Developed from POC: <Button 
                          variant="link" 
                          className="h-auto p-0"
                          onClick={() => navigate(`/pocs/${project.pocId}`)}
                        >
                          View POC
                        </Button>
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.comments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No comments yet. Be the first to add a comment.
                </div>
              ) : (
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{comment.author.name}</p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {hasPermission('comment', 'add') && (
              <CardFooter>
                <form onSubmit={handleSubmitComment} className="w-full space-y-3">
                  <Textarea 
                    placeholder="Add your comment..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    type="submit" 
                    disabled={!commentText.trim() || submitting}
                    className="ml-auto"
                  >
                    Post Comment
                  </Button>
                </form>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(project.status)}
                >
                  {project.status}
                </Badge>
              </div>

              {hasPermission('project', 'edit') && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Update status:</p>
                  <Select 
                    value={project.status} 
                    onValueChange={(value) => handleStatusChange(value as ProjectStatus)}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-base font-medium">
                  {format(new Date(project.startDate), "MMM d, yyyy")}
                </p>
              </div>

              <div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  {project.endDate && (
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(project.endDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                {hasPermission('project', 'edit') && (
                  <form className="mt-2" onSubmit={handleEndDateUpdate}>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        variant="outline" 
                        size="sm"
                        disabled={isEndDateUpdating}
                      >
                        {isEndDateUpdating ? 'Saving...' : 'Update'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Technical Lead</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={project.lead?.avatar} />
                    <AvatarFallback>{project.lead?.name.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <span>{project.lead?.name || 'Unassigned'}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <p className="text-sm font-medium text-gray-500">Account Manager</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={project.accountManager?.avatar} />
                    <AvatarFallback>{project.accountManager?.name.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <span>{project.accountManager?.name || 'Unassigned'}</span>
                </div>
              </div>

              <Separator className="my-2" />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                {project.team.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-1">No team members assigned</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {project.team.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-base font-medium">{project.customer?.name}</p>
              <div className="text-sm">
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  {project.customer?.contact_person}
                </p>
                <p className="text-gray-500 mt-1">
                  {project.customer?.contact_email}<br />
                  {project.customer?.contact_phone}
                </p>
              </div>
              <div className="mt-1 pt-2 border-t border-gray-100">
                <p className="text-sm">
                  <span className="text-gray-500">Industry:</span>{' '}
                  {project.customer?.industry}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Type:</span>{' '}
                  {project.customer?.organization_type}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectDetailPage;
