
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  Users,
  Building,
  UserCheck,
  FileCheck,
} from 'lucide-react';

import { getCustomers, getEmployees, getProject, createProject, updateProject, ProjectTechnology, ProjectStatus } from '../services/api';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';

// Define technologies
const TECHNOLOGIES: ProjectTechnology[] = [
  'switching',
  'routers',
  'security',
  'wireless',
  'firewall',
  'access points',
  'webex communication',
  'ip phones',
  'AppDynamics',
  'Splunk',
  'Webex Room Kits',
];

// Define project statuses
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

// Form validation schema using Zod
const formSchema = z.object({
  customerId: z.string({
    required_error: "Please select a customer",
  }),
  title: z.string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  technology: z.enum(TECHNOLOGIES as [ProjectTechnology, ...ProjectTechnology[]]),
  status: z.enum(PROJECT_STATUSES as [ProjectStatus, ...ProjectStatus[]]),
  leadId: z.string({
    required_error: "Please select a technical lead",
  }),
  accountManagerId: z.string({
    required_error: "Please select an account manager",
  }),
  teamIds: z.array(z.string()).optional(),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date().nullable().optional(),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProjectFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; role: string }[]>([]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      title: '',
      technology: 'security',
      status: 'Account Manager coordinated with Tech Lead',
      leadId: '',
      accountManagerId: '',
      teamIds: [],
      startDate: new Date(),
      endDate: null,
      comment: '',
    },
  });

  useEffect(() => {
    // Fetch form dependencies
    const fetchDependencies = async () => {
      try {
        setIsLoading(true);
        
        // Fetch customers
        const customersData = await getCustomers();
        setCustomers(customersData.map(c => ({ id: c.id, name: c.name })));
        
        // Fetch employees
        const employeesData = await getEmployees();
        setEmployees(employeesData.map(e => ({ 
          id: e.id, 
          name: e.name, 
          role: e.role 
        })));
        
        // If editing, fetch project details
        if (isEditing && id) {
          const projectData = await getProject(id);
          if (projectData) {
            // Populate form with project data
            form.reset({
              customerId: projectData.customerId,
              title: projectData.title,
              technology: projectData.technology as ProjectTechnology,
              status: projectData.status as ProjectStatus,
              leadId: projectData.leadId,
              accountManagerId: projectData.accountManagerId,
              teamIds: projectData.team.map(member => member.id),
              startDate: new Date(projectData.startDate),
              endDate: projectData.endDate ? new Date(projectData.endDate) : null,
              comment: '',
            });
          } else {
            toast.error("Couldn't find project details");
            navigate('/projects');
          }
        }
      } catch (error) {
        console.error("Error fetching form dependencies:", error);
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependencies();
  }, [id, isEditing, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You need to be logged in to perform this action");
      return;
    }
    
    try {
      setIsSaving(true);

      // Prepare team members
      const team = values.teamIds ? employees
        .filter(e => values.teamIds?.includes(e.id))
        .map(e => ({ id: e.id, name: e.name, role: e.role })) : [];

      // Prepare data for API
      const projectData = {
        customerId: values.customerId,
        title: values.title,
        technology: values.technology,
        status: values.status,
        leadId: values.leadId,
        accountManagerId: values.accountManagerId,
        team,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      };

      let result;
      
      // Create or update project
      if (isEditing && id) {
        result = await updateProject(id, projectData);
        
        // Add comment if provided
        if (values.comment && result) {
          await addComment(id, values.comment, user.id, 'project');
        }
        
        toast.success("Project updated successfully");
      } else {
        result = await createProject(projectData);
        
        // Add comment if provided
        if (values.comment && result) {
          await addComment(result.id, values.comment, user.id, 'project');
        }
        
        toast.success("Project created successfully");
      }
      
      navigate(`/projects/${result?.id || ''}`);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(isEditing ? "Failed to update project" : "Failed to create project");
    } finally {
      setIsSaving(false);
    }
  };

  const filterLeads = employees.filter(e => e.role === 'lead');
  const filterAccountManagers = employees.filter(e => e.role === 'account_manager');
  
  // Filter team members (exclude already selected lead)
  const getAvailableTeamMembers = () => {
    const leadId = form.watch('leadId');
    return employees.filter(e => e.id !== leadId);
  };

  if (isLoading) {
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
          onClick={() => navigate('/projects')}
          className="flex items-center mb-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </button>
        
        <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Project' : 'Create New Project'}</h1>
        <p className="text-gray-500">
          {isEditing 
            ? 'Update project details and team assignments' 
            : 'Create a new project from scratch'
          }
        </p>
      </div>

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Basic information about the project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Selection */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isEditing} // Cannot change customer in edit mode
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        <div className="flex items-center text-amber-500">
                          <Building className="w-4 h-4 mr-1" />
                          {isEditing ? "Customer cannot be changed after project creation" : "Select the customer for this project"}
                        </div>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Project Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Technology */}
                  <FormField
                    control={form.control}
                    name="technology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technology</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select technology" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TECHNOLOGIES.map(tech => (
                              <SelectItem key={tech} value={tech}>
                                {tech}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_STATUSES.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Project Timeline */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Project Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isEditing} // Cannot change start date in edit mode
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            <div className="flex items-center text-amber-500">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {isEditing ? "Start date cannot be changed after project creation" : "When does the project start?"}
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date (Optional) */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return date < startDate;
                                }}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When is the project expected to end?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Team Assignment */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Team Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Technical Lead */}
                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technical Lead</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select technical lead" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filterLeads.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>
                                  {lead.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="flex items-center">
                            <UserCheck className="w-4 h-4 mr-1" />
                            The lead is responsible for technical execution
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Account Manager */}
                    <FormField
                      control={form.control}
                      name="accountManagerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Manager</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filterAccountManagers.map(manager => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Handles client relationship and coordination
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Team Members (Multi-select) */}
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="teamIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Members (Optional)</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                const currentValues = field.value || [];
                                const newValues = currentValues.includes(value)
                                  ? currentValues.filter(v => v !== value)
                                  : [...currentValues, value];
                                field.onChange(newValues);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select team members" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableTeamMembers().map(employee => (
                                  <SelectItem key={employee.id} value={employee.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{employee.name}</span>
                                      {field.value?.includes(employee.id) && (
                                        <Check className="h-4 w-4 ml-2" />
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            {field.value && field.value.length > 0 
                              ? `${field.value.length} team member${field.value.length !== 1 ? 's' : ''} selected` 
                              : 'No team members selected'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Comment Section */}
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add initial comment or notes about this project" 
                          className="h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center">
                        <FileCheck className="w-4 h-4 mr-1" />
                        Include any relevant information about the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                )}
                {isEditing ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

// Add missing async import for consistency
import { addComment } from '../services/api';

export default ProjectFormPage;
