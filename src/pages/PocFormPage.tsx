import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPoc, 
  getEmployees, 
  getCustomers, 
  getEmployeesByRole,
  createPoc, 
  updatePoc, 
  addComment,
  createCustomer,
  Poc, 
  Employee, 
  PocStatus, 
  PocTechnology,
  Customer,
  PocTeamMember,
  CustomerType
} from '../services/api';
import { format } from 'date-fns';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { X, ArrowLeft, Plus, Check, Calendar as CalendarIcon, Info, Building } from 'lucide-react';
import { toast } from "sonner";

// Define a form type for the new customer form
interface CustomerFormData {
  name: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  organizationType: string;
}

// The rest of the FormData interface remains the same
interface FormData {
  title: string;
  status: PocStatus;
  technology: PocTechnology;
  customerId: string;
  leadId: string;
  accountManagerId: string;
  teamMembers: PocTeamMember[];
  startDate: string;
  endDate: string;
  comment?: string;
}

const PocFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Employee[]>([]);
  const [accountManagers, setAccountManagers] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [startDateVal, setStartDateVal] = useState<Date | undefined>(undefined);
  const [endDateVal, setEndDateVal] = useState<Date | undefined>(undefined);
  const [commentText, setCommentText] = useState('');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  
  // Form for the main POC
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      status: 'Account Manager coordinated with Tech Lead',
      technology: 'switching',
      customerId: '',
      leadId: '',
      accountManagerId: '',
      teamMembers: [],
      startDate: '',
      endDate: '',
      comment: ''
    }
  });

  // Form for the new customer
  const customerForm = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      website: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      industry: 'industry1',
      organizationType: 'Private',
    }
  });

  const watchTeamMembers = form.watch('teamMembers', []);
  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');

  // Fetch employees, customers and POC data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [employeesData, leadsData, accountManagersData, customersData] = await Promise.all([
          getEmployees(),
          getEmployeesByRole('lead'),
          getEmployeesByRole('account_manager'),
          getCustomers()
        ]);
        
        setEmployees(employeesData);
        setLeads(leadsData);
        setAccountManagers(accountManagersData);
        setCustomers(customersData);
        
        if (isEditMode && id) {
          const pocData = await getPoc(id);
          if (pocData) {
            // Transform team data to include roles
            const teamMembers = pocData.team.map(member => ({
              id: member.id,
              role: member.role === 'lead' ? 'lead' as const : 'support' as const
            }));
            
            form.reset({
              title: pocData.title,
              status: pocData.status,
              technology: pocData.technology,
              customerId: pocData.customerId,
              leadId: pocData.leadId,
              accountManagerId: pocData.accountManagerId,
              teamMembers: teamMembers,
              startDate: pocData.startDate,
              endDate: pocData.endDate || ''
            });

            // Set date state for the calendar components
            if (pocData.startDate) {
              setStartDateVal(new Date(pocData.startDate));
            }
            if (pocData.endDate) {
              setEndDateVal(new Date(pocData.endDate));
            }
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
  }, [isEditMode, id, navigate, form]);

  // Check permissions for accessing this page
  useEffect(() => {
    if (!hasPermission(isEditMode ? 'poc' : 'poc', isEditMode ? 'edit' : 'create')) {
      navigate('/unauthorized');
    }
  }, [hasPermission, isEditMode, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      
      // Map team members to Employee objects with selected roles
      const team = data.teamMembers.map(tm => {
        // We already have the full employee objects in teamMembers
        return {
          ...tm
        };
      });
      
      // Prepare customer data
      const customer = customers.find(c => c.id === data.customerId);
      
      // Prepare lead data
      const lead = employees.find(emp => emp.id === data.leadId);
      
      // Prepare account manager data
      const accountManager = employees.find(emp => emp.id === data.accountManagerId);
      
      if (isEditMode && id) {
        // Update existing POC
        const updateData = {
          title: data.title,
          status: data.status,
          technology: data.technology,
          leadId: data.leadId,
          accountManagerId: data.accountManagerId,
          team,
          endDate: data.endDate || undefined
        };
        
        const updatedPoc = await updatePoc(id, updateData);
        
        // Add comment if provided
        if (data.comment && data.comment.trim() !== '' && user) {
          await addComment(id, data.comment, user.id);
        }
        
        if (updatedPoc) {
          toast.success('POC updated successfully');
          navigate(`/pocs/${id}`);
        }
      } else {
        // Create new POC
        const newPocData = {
          title: data.title,
          description: "N/A", // Provide a placeholder since description is required in the API
          status: data.status,
          technology: data.technology,
          customerId: data.customerId,
          customer,
          leadId: data.leadId,
          lead,
          accountManagerId: data.accountManagerId,
          accountManager,
          team,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          tags: [], // Empty array since we've removed tags
          comments: []
        };
        
        const newPoc = await createPoc(newPocData);
        
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

  const handleCustomerFormSubmit = async (data: CustomerFormData) => {
    try {
      // Create a new customer with the API
      const newCustomer = await createCustomer({
        name: data.name,
        contact_person: data.contactPerson,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        industry: data.industry,
        organization_type: data.organizationType.toLowerCase() as CustomerType, // Cast to CustomerType
        website: data.website || ''
      });

      if (newCustomer) {
        // Add the new customer to the local state
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
        
        // Set the new customer as the selected customer
        form.setValue('customerId', newCustomer.id);
        
        // Reset the customer form
        customerForm.reset();
        
        // Close the dialog
        setIsNewCustomerDialogOpen(false);
        
        toast.success('Customer created successfully');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const toggleTeamMember = (employeeId: string, role: 'lead' | 'support') => {
    const currentTeamMembers = [...watchTeamMembers];
    const existingMemberIndex = currentTeamMembers.findIndex(m => m.id === employeeId);
    
    // Find the complete employee object
    const employeeData = employees.find(e => e.id === employeeId);
    if (!employeeData) {
      console.error(`Employee with ID ${employeeId} not found`);
      return;
    }
    
    // If setting as lead, ensure no other member is a lead
    if (role === 'lead') {
      // Remove lead role from any existing lead
      const existingLeadIndex = currentTeamMembers.findIndex(m => m.role === 'lead');
      if (existingLeadIndex >= 0) {
        currentTeamMembers[existingLeadIndex].role = 'support';
        
        // If we're changing an existing member to lead, show a notification
        if (existingLeadIndex !== existingMemberIndex) {
          const existingLead = employees.find(e => e.id === currentTeamMembers[existingLeadIndex].id);
          if (existingLead) {
            toast.info(`${existingLead.name} is now set as support`);
          }
        }
      }
    }
    
    // Create a proper PocTeamMember object with all required properties from the employee
    const teamMember: PocTeamMember = {
      ...employeeData, // Copy all properties from the employee
      role: role // Override the role with the selected role for this POC
    };
    
    if (existingMemberIndex >= 0) {
      // Update the role if the employee is already selected
      currentTeamMembers[existingMemberIndex] = {
        ...currentTeamMembers[existingMemberIndex],
        role: role
      };
    } else {
      // Add the new team member
      currentTeamMembers.push(teamMember);
    }
    
    form.setValue('teamMembers', currentTeamMembers);
  };

  const removeTeamMember = (employeeId: string) => {
    form.setValue(
      'teamMembers',
      watchTeamMembers.filter(m => m.id !== employeeId)
    );
  };

  const handleSetDate = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
      form.setValue(field, formattedDate);

      if (field === 'startDate') {
        setStartDateVal(date);
      } else {
        setEndDateVal(date);
      }
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Customer Details Card (Renamed from Basic Information) */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerId"
                  rules={{ required: 'Customer is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <div className="space-y-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isEditMode} // Customer cannot be changed in edit mode
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                            {!isEditMode && (
                              <div className="p-2">
                                <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full flex items-center justify-center">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add New Customer
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Add New Customer</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={customerForm.handleSubmit(handleCustomerFormSubmit)} className="space-y-4 mt-4">
                                      <FormField
                                        control={customerForm.control}
                                        name="name"
                                        rules={{ required: 'Customer name is required' }}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Customer Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={customerForm.control}
                                        name="website"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                              <Input {...field} type="url" placeholder="https://example.com" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={customerForm.control}
                                        name="contactPerson"
                                        rules={{ required: 'Contact person is required' }}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                          control={customerForm.control}
                                          name="contactEmail"
                                          rules={{ 
                                            required: 'Email is required',
                                            pattern: {
                                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                              message: 'Invalid email address'
                                            }
                                          }}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Contact Email</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="email" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={customerForm.control}
                                          name="contactPhone"
                                          rules={{ required: 'Phone number is required' }}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Contact Mobile</FormLabel>
                                              <FormControl>
                                                <Input {...field} type="tel" />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                          control={customerForm.control}
                                          name="industry"
                                          rules={{ required: 'Industry is required' }}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Industry</FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select industry" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value="industry1">Industry 1</SelectItem>
                                                  <SelectItem value="industry2">Industry 2</SelectItem>
                                                  <SelectItem value="industry3">Industry 3</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={customerForm.control}
                                          name="organizationType"
                                          rules={{ required: 'Organization type is required' }}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Organization Type</FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value="governmental">Governmental</SelectItem>
                                                  <SelectItem value="private">Private</SelectItem>
                                                  <SelectItem value="semi-private">Semi-Private</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      
                                      <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
                                          Cancel
                                        </Button>
                                        <Button type="submit">Create Customer</Button>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {!isEditMode && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setIsNewCustomerDialogOpen(true)}
                          >
                            <Building className="h-4 w-4 mr-2" />
                            Create New Customer
                          </Button>
                        )}
                      </div>
                      
                      {isEditMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center mt-1 text-xs text-amber-600">
                                <Info className="h-3 w-3 mr-1" />
                                Customer cannot be changed after creation
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Customer assignment is permanent and cannot be modified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditMode && (
                  <div>
                    <FormLabel>Add Comment</FormLabel>
                    <Input
                      className="mt-1"
                      placeholder="Add a comment about this POC..."
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        form.setValue('comment', e.target.value);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Account Manager coordinated with Tech Lead">
                            Account Manager coordinated with Tech Lead
                          </SelectItem>
                          <SelectItem value="Tech Lead reached the customer">
                            Tech Lead reached the customer
                          </SelectItem>
                          <SelectItem value="Tech Lead assigned engineering team">
                            Tech Lead assigned engineering team
                          </SelectItem>
                          <SelectItem value="Kickoff is done & scopes defined">
                            Kickoff is done & scopes defined
                          </SelectItem>
                          <SelectItem value="In progress">In progress</SelectItem>
                          <SelectItem value="Customer pending">Customer pending</SelectItem>
                          <SelectItem value="Taqniyat pending">Taqniyat pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technology"
                  rules={{ required: 'Technology is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technology" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="switching">Switching</SelectItem>
                          <SelectItem value="routers">Routers</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="wireless">Wireless</SelectItem>
                          <SelectItem value="firewall">Firewall</SelectItem>
                          <SelectItem value="access points">Access Points</SelectItem>
                          <SelectItem value="webex communication">Webex Communication</SelectItem>
                          <SelectItem value="ip phones">IP Phones</SelectItem>
                          <SelectItem value="AppDynamics">AppDynamics</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Splunk">Splunk</SelectItem>
                          <SelectItem value="Webex Room Kits">Webex Room Kits</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    rules={{ required: 'Start date is required' }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !field.value ? 'text-muted-foreground' : ''
                              }`}
                              disabled={isEditMode} // Start date cannot be changed in edit mode
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDateVal ? format(startDateVal, 'PP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDateVal}
                              onSelect={(date) => handleSetDate('startDate', date)}
                              initialFocus
                              disabled={isEditMode} // Start date cannot be changed in edit mode
                            />
                          </PopoverContent>
                        </Popover>
                        {isEditMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center mt-1 text-xs text-amber-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  Start date cannot be changed
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Start date is permanent and cannot be modified</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !field.value ? 'text-muted-foreground' : ''
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDateVal ? format(endDateVal, 'PP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDateVal}
                              onSelect={(date) => handleSetDate('endDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Team Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="leadId"
                  rules={{ required: 'Technical Lead is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Lead</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leads.map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountManagerId"
                  rules={{ required: 'Account Manager is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Manager</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountManagers.map(manager => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            className="p-3 hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="mb-2">
                              <p className="text-sm font-medium">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.role}</p>
                            </div>
                            <div className="flex justify-between gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`flex-1 ${
                                  watchTeamMembers.find(m => m.id === emp.id && m.role === 'lead') ? 'bg-green-50 border-green-200' : ''
                                }`}
                                onClick={() => toggleTeamMember(emp.id, 'lead')}
                              >
                                {watchTeamMembers.find(m => m.id === emp.id && m.role === 'lead') ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : null}
                                Lead
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`flex-1 ${
                                  watchTeamMembers.find(m => m.id === emp.id && m.role === 'support') ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => toggleTeamMember(emp.id, 'support')}
                              >
                                {watchTeamMembers.find(m => m.id === emp.id && m.role === 'support') ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : null}
                                Support
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {watchTeamMembers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Selected Team Members:</p>
                      <div className="space-y-1">
                        {watchTeamMembers.map(member => {
                          const emp = employees.find(e => e.id === member.id);
                          return emp ? (
                            <div key={member.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                              <div className="flex items-center">
                                <span>{emp.name}</span>
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                  member.role === 'lead' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {member.role === 'lead' ? 'Lead' : 'Support'}
                                </span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeTeamMember(member.id)}
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

            {/* Submit buttons card */}
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
        </form>
      </Form>
    </AppLayout>
  );
};

export default PocFormPage;
