
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, Phone, Tag, FileCheck, MapPin, CheckCircle, Briefcase } from 'lucide-react';
import { updateEmployeeInfo } from '../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const MyInfoPage: React.FC = () => {
  const { user, updateUserInfo } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
    workExtension: user?.workExtension || '',
    skills: user?.skills?.join(', ') || '',
    certificates: user?.certificates?.join(', ') || '',
    location: user?.location || 'in-office',
    status: user?.status || 'active',
    jobTitle: user?.jobTitle || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      // Update in backend
      const processedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        certificates: formData.certificates.split(',').map(c => c.trim()).filter(Boolean),
      };
      
      await updateEmployeeInfo(user.id, processedData);
      
      // Update in context
      updateUserInfo(processedData);
      
      toast.success('Your information has been updated');
    } catch (error) {
      console.error('Error updating information:', error);
      toast.error('Failed to update your information');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Information</h1>
        <p className="text-gray-500">Update your personal and work information</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-100 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription className="text-gray-600">{user.department || 'Department not set'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4">
                  <Phone className="w-5 h-5 mr-2 text-gray-500" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Work Extension</label>
                    <Input 
                      name="workExtension"
                      value={formData.workExtension}
                      onChange={handleChange}
                      placeholder="Work extension"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4">
                  <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
                  Work Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Title</label>
                      <Input 
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="Job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on leave">On Leave</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleSelectChange('location', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="in-office">In-office</SelectItem>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="off-site">Off-site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium flex items-center mb-4">
                  <Tag className="w-5 h-5 mr-2 text-gray-500" />
                  Skills & Certifications
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                      <Textarea 
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="Enter skills separated by commas"
                        className="pl-10 min-h-24"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter skills separated by commas (e.g., React, TypeScript, Node.js)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Certificates</label>
                    <div className="relative">
                      <FileCheck className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                      <Textarea 
                        name="certificates"
                        value={formData.certificates}
                        onChange={handleChange}
                        placeholder="Enter certificates separated by commas"
                        className="pl-10 min-h-24"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter certificates separated by commas</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-4">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 ml-auto" 
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </AppLayout>
  );
};

export default MyInfoPage;
