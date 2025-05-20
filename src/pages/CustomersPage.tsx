
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Mail, Phone, Edit, Industry, Search } from 'lucide-react';
import { Customer, CustomerType, getCustomers, updateCustomer } from '../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const CustomerCard: React.FC<{ 
  customer: Customer; 
  canEdit: boolean; 
  onCustomerUpdated: () => void; 
}> = ({ customer, canEdit, onCustomerUpdated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...customer });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      organization_type: value as CustomerType 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await updateCustomer(customer.id, formData);
      toast.success(`${customer.name} updated successfully`);
      setOpen(false);
      onCustomerUpdated();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2 text-indigo-600" />
          {customer.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Contact Person:</span>
            <span className="font-medium">{customer.contact_person}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Email:</span>
            <span className="font-medium">{customer.contact_email}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Phone:</span>
            <span className="font-medium">{customer.contact_phone}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Industry:</span>
            <span className="font-medium">{customer.industry}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Type:</span>
            <span className="font-medium capitalize">{customer.organization_type.replace('-', ' ')}</span>
          </div>
        </div>
      </CardContent>
      {canEdit && (
        <CardFooter className="border-t p-4 bg-gray-50">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Customer</DialogTitle>
                  <DialogDescription>
                    Update customer information. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Company name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Person</label>
                      <Input 
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Contact person"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Type</label>
                      <Select
                        value={formData.organization_type}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="governmental">Governmental</SelectItem>
                          <SelectItem value="semi-private">Semi-private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <div className="relative">
                      <Industry className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="Industry"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        placeholder="Contact email"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="Contact phone"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
};

const CustomersPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const canEditCustomers = hasPermission('customer', 'edit');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-gray-500">View and manage customer information</p>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16">
          <Building className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            {searchTerm ? 'Try adjusting your search term' : 'There are no customers in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              canEdit={canEditCustomers}
              onCustomerUpdated={loadCustomers}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default CustomersPage;
