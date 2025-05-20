
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEmployees, Employee } from '../services/api';
import AppLayout from '../components/AppLayout';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  lead: 'bg-blue-100 text-blue-700 border-blue-200',
  developer: 'bg-green-100 text-green-700 border-green-200',
  account_manager: 'bg-amber-100 text-amber-700 border-amber-200',
};

const EmployeeListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user has permission to view employees
    if (!hasPermission('employee', 'view')) {
      // This will be caught by the ProtectedRoute component
      return;
    }

    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [hasPermission]);

  const filteredEmployees = employees.filter(employee => {
    const searchValue = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchValue) ||
      employee.email.toLowerCase().includes(searchValue) ||
      employee.department.toLowerCase().includes(searchValue) ||
      employee.role.toLowerCase().includes(searchValue)
    );
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Employee Directory</h1>
        <p className="text-gray-500">View and manage team members</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
            <p className="text-gray-500 text-center mt-2">
              {searchTerm ? "Try adjusting your search criteria" : "No employees have been added yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={roleColors[employee.role]}
                        >
                          {employee.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a 
                            href={`mailto:${employee.email}`} 
                            className="p-1 text-gray-500 hover:text-primary"
                            title={employee.email}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                          <a 
                            href="tel:+11234567890" 
                            className="p-1 text-gray-500 hover:text-primary"
                            title="+1 (123) 456-7890"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};

export default EmployeeListPage;
