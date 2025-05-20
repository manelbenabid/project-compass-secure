
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { getPoc, getEmployees, createPoc, updatePoc, Poc, Employee, PocStatus } from '../services/api';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, ArrowLeft, Plus, Check } from 'lucide-react';
import { toast } from "sonner";

interface FormData {
  title: string;
  description: string;
  status: PocStatus;
  leadId: string;
  teamIds: string[];
  tags: string[];
}

const PocFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'proposed',
      leadId: '',
      teamIds: [],
      tags: [],
    },
  });

  const watchTags = watch('tags', []);
  const watchTeamIds = watch('teamIds', []);

  // Fetch employees and POC data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        if (isEditMode && id) {
          const pocData = await getPoc(id);
          if (pocData) {
            setValue('title', pocData.title);
            setValue('description', pocData.description);
            setValue('status', pocData.status);
            setValue('leadId', pocData.leadId);
            setValue('teamIds', pocData.team.map(member => member.id));
            setValue('tags', pocData.tags);
          } else {
            toast.error('POC not found');
            navigate('/pocs');
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditMode, id, navigate, setValue]);

  // Check permissions for accessing this page
  useEffect(() => {
    if (!hasPermission(isEditMode ? 'poc' : 'poc', isEditMode ? 'edit' : 'create')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, isEditMode, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      
      // Prepare team data
      const team = employees.filter(emp => data.teamIds.includes(emp.id));
      
      if (isEditMode && id) {
        const updatedPoc = await updatePoc(id, {
          title: data.title,
          description: data.description,
          status: data.status,
          leadId: data.leadId,
          team,
          tags: data.tags,
        });
        
        if (updatedPoc) {
          toast.success('POC updated successfully');
          navigate(`/pocs/${id}`);
        }
      } else {
        const newPoc = await createPoc({
          title: data.title,
          description: data.description,
          status: data.status,
          leadId: data.leadId,
          lead: employees.find(emp => emp.id === data.leadId),
          team,
          tags: data.tags,
          comments: [],
        });
        
        if (newPoc) {
          toast.success('POC created successfully');
          navigate(`/pocs/${newPoc.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving POC:', error);
      toast.error(isEditMode ? 'Failed to update POC' : 'Failed to create POC');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!watchTags.includes(newTag)) {
      setValue('tags', [...watchTags, newTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchTags.filter(tag => tag !== tagToRemove)
    );
  };

  const toggleTeamMember = (employeeId: string) => {
    const isSelected = watchTeamIds.includes(employeeId);
    
    if (isSelected) {
      setValue(
        'teamIds',
        watchTeamIds.filter(id => id !== employeeId)
      );
    } else {
      setValue('teamIds', [...watchTeamIds, employeeId]);
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

  return (
    <AppLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate(isEditMode ? `/pocs/${id}` : '/pocs')}
          className="flex items-center mb-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {isEditMode ? 'Back to POC Details' : 'Back to POCs'}
        </button>
        
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Edit POC' : 'Create New POC'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    rows={5}
                    {...register('description', { required: 'Description is required' })}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {watchTags.map((tag, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center text-sm"
                      >
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as PocStatus)}
                  >
                    <SelectTrigger id="status" className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Lead
                  </label>
                  <Select
                    value={watch('leadId')}
                    onValueChange={(value) => setValue('leadId', value)}
                  >
                    <SelectTrigger id="lead" className={errors.leadId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter(emp => emp.role === 'lead' || emp.role === 'admin')
                        .map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.leadId && (
                    <p className="mt-1 text-sm text-red-600">{errors.leadId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Members
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Select Team Members
                        <Plus className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <div className="max-h-72 overflow-auto">
                        {employees.map(emp => (
                          <div 
                            key={emp.id} 
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleTeamMember(emp.id)}
                          >
                            <div>
                              <p className="text-sm font-medium">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.role}</p>
                            </div>
                            {watchTeamIds.includes(emp.id) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {watchTeamIds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Selected Team Members:</p>
                      <div className="space-y-1">
                        {watchTeamIds.map(id => {
                          const emp = employees.find(e => e.id === id);
                          return emp ? (
                            <div key={id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                              <span>{emp.name}</span>
                              <button 
                                type="button" 
                                onClick={() => toggleTeamMember(id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardFooter className="pt-6">
                <div className="flex space-x-2 w-full">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(isEditMode ? `/pocs/${id}` : '/pocs')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : isEditMode ? 'Update POC' : 'Create POC'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default PocFormPage;
