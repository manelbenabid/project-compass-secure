
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPoc, addComment, updatePoc, Poc, PocStatus } from '../services/api';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
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
  User, 
  CheckCircle, 
  Clock, 
  FileCode, 
  Archive 
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

const PocDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [poc, setPoc] = useState<Poc | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchPoc = async () => {
      if (!id) return;
      
      try {
        const data = await getPoc(id);
        setPoc(data);
      } catch (error) {
        console.error('Error fetching POC details:', error);
        toast.error('Failed to load POC details');
      } finally {
        setLoading(false);
      }
    };

    fetchPoc();
  }, [id]);

  const handleStatusChange = async (newStatus: PocStatus) => {
    if (!poc || !id || newStatus === poc.status) return;
    
    try {
      setStatusUpdating(true);
      const updated = await updatePoc(id, { status: newStatus });
      if (updated) {
        setPoc(updated);
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
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
    if (!commentText.trim() || !poc || !user) return;
    
    try {
      setSubmitting(true);
      const newComment = await addComment(poc.id, commentText, user.id);
      
      if (newComment) {
        setPoc({
          ...poc,
          comments: [...poc.comments, newComment]
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!poc) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">POC Not Found</h2>
          <p className="text-gray-500 mb-6">
            The proof of concept you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/pocs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to POCs
          </Button>
        </div>
      </AppLayout>
    );
  }

  const StatusIcon = statusIcons[poc.status];

  return (
    <AppLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/pocs')}
          className="flex items-center mb-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to POCs
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{poc.title}</h1>
            <p className="text-gray-500">Created on {new Date(poc.createdAt).toLocaleDateString()}</p>
          </div>
          {hasPermission('poc', 'edit') && (
            <Button onClick={() => navigate(`/pocs/${poc.id}/edit`)} className="mt-4 sm:mt-0">
              <Edit className="w-4 h-4 mr-2" />
              Edit POC
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
              <p className="text-gray-700">{poc.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {poc.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
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
              {poc.comments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No comments yet. Be the first to add a comment.
                </div>
              ) : (
                <div className="space-y-4">
                  {poc.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{comment.author.name}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
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
              <div className="flex items-center space-x-2 mb-4">
                <StatusIcon className="h-5 w-5 text-gray-500" />
                <Badge 
                  variant="outline" 
                  className={statusColors[poc.status]}
                >
                  {poc.status.replace('_', ' ')}
                </Badge>
              </div>

              {hasPermission('poc', 'edit') && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Update status:</p>
                  <Select 
                    value={poc.status} 
                    onValueChange={(value) => handleStatusChange(value as PocStatus)}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Lead</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={poc.lead?.avatar} />
                    <AvatarFallback>{poc.lead?.name.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <span>{poc.lead?.name || 'Unassigned'}</span>
                </div>
              </div>

              <Separator className="my-2" />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                {poc.team.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-1">No team members assigned</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {poc.team.map((member) => (
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
        </div>
      </div>
    </AppLayout>
  );
};

export default PocDetailPage;
