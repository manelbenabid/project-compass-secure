
import { delay } from '../utils';

export type CustomerType = 'private' | 'governmental' | 'semi-private';

export interface Customer {
  id: string;
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  organization_type: CustomerType;
  website?: string;  // Added website field
}

const CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Acme Corp',
    contact_person: 'John Doe',
    contact_email: 'john.doe@acme.com',
    contact_phone: '123-456-7890',
    industry: 'Technology',
    organization_type: 'private',
    website: 'https://www.acme.com',
  },
  {
    id: 'cust_2',
    name: 'Beta Inc',
    contact_person: 'Jane Smith',
    contact_email: 'jane.smith@beta.com',
    contact_phone: '987-654-3210',
    industry: 'Finance',
    organization_type: 'governmental',
    website: 'https://www.beta.com',
  },
  {
    id: 'cust_3',
    name: 'Gamma Ltd',
    contact_person: 'Peter Jones',
    contact_email: 'peter.jones@gamma.com',
    contact_phone: '111-222-3333',
    industry: 'Healthcare',
    organization_type: 'semi-private',
    website: 'https://www.gamma.com',
  },
];

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    // Simulate API call
    await delay(500);
    return CUSTOMERS;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};

export const updateCustomer = async (id: string, customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    // Simulate API call
    await delay(500);

    const index = CUSTOMERS.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    CUSTOMERS[index] = { id, ...customerData };
    return CUSTOMERS[index];
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
};

export const createCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    // Simulate API call
    await delay(500);
    
    const newCustomer: Customer = {
      id: `cust_${Math.random().toString(36).substr(2, 9)}`,
      name: customerData.name,
      contact_person: customerData.contact_person,
      contact_email: customerData.contact_email,
      contact_phone: customerData.contact_phone,
      industry: customerData.industry,
      organization_type: customerData.organization_type as CustomerType,
      website: customerData.website
    };
    
    CUSTOMERS.push(newCustomer);
    return newCustomer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
};

// Updated interfaces for other API functions with all required properties
export type PocStatus = 'proposed' | 'in_progress' | 'completed' | 'archived' | 
                       'Account Manager coordinated with Tech Lead' | 'Tech Lead reached the customer' |
                       'Tech Lead assigned engineering team' | 'Kickoff is done & scopes defined' |
                       'In progress' | 'Customer pending' | 'Taqniyat pending' | 'Done' | 'Failed';

export type PocTechnology = string;

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  work_extension?: string;
  role: string;
  department: string;
  avatar?: string;
  skills?: string[];
  certificates?: string[];
  location?: string;
  status?: string;
  job_title?: string;
  // Add other necessary properties
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: Employee;
}

export interface PocTeamMember extends Employee {
  role: string;
}

export interface Poc {
  id: string;
  title: string;
  description: string;
  status: PocStatus;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  technology: string;
  customerId: string;
  customer?: Customer;
  leadId: string;
  lead?: Employee;
  accountManagerId: string;
  accountManager?: Employee;
  team: PocTeamMember[];
  startDate: string;
  endDate?: string;
  endTime?: string;
  comments: Comment[];
}

export const getPocs = async (): Promise<Poc[]> => {
  // Mock implementation
  await delay(500);
  return []; // Return empty array for now
};

export const getPoc = async (id: string): Promise<Poc | null> => {
  // Mock implementation
  await delay(500);
  return null; // Return null for now
};

export const addComment = async (pocId: string, comment: string, authorId?: string): Promise<Comment | void> => {
  // Mock implementation
  await delay(500);
  // Return a mock comment
  return {
    id: `comment_${Math.random().toString(36).substr(2, 9)}`,
    text: comment,
    createdAt: new Date().toISOString(),
    author: {
      id: authorId || 'unknown',
      name: 'User',
      email: 'user@example.com',
      role: 'user',
      department: 'N/A'
    }
  };
};

export const updatePoc = async (id: string, pocData: Partial<Poc>): Promise<Poc> => {
  // Mock implementation
  await delay(500);
  // Return a mock updated POC
  return {
    id,
    title: 'Updated POC',
    description: 'Updated description',
    status: pocData.status || 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    technology: pocData.technology || 'N/A',
    customerId: 'cust_1',
    leadId: 'emp_1',
    accountManagerId: 'emp_2',
    team: [],
    startDate: new Date().toISOString(),
    endDate: pocData.endDate,
    endTime: pocData.endTime,
    comments: []
  };
};

export const createPoc = async (pocData: Omit<Poc, 'id' | 'createdAt' | 'updatedAt'>): Promise<Poc> => {
  // Mock implementation
  await delay(500);
  // Return a mock created POC
  return {
    id: `poc_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...pocData
  };
};

export const getEmployees = async (): Promise<Employee[]> => {
  // Mock implementation
  await delay(500);
  return [
    {
      id: 'emp_1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'developer',
      department: 'Engineering',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 'emp_2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'lead',
      department: 'Engineering',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 'emp_3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'account_manager',
      department: 'Sales',
      avatar: 'https://i.pravatar.cc/150?img=3'
    }
  ];
};

export const getEmployeesByRole = async (role: string): Promise<Employee[]> => {
  // Mock implementation
  const employees = await getEmployees();
  return employees.filter(emp => emp.role === role);
};

export const updateEmployeeInfo = async (id: string, data: Partial<Employee>): Promise<Employee> => {
  // Mock implementation
  await delay(500);
  return {
    id,
    name: 'Updated Employee',
    email: 'updated@example.com',
    role: 'developer',
    department: 'Engineering',
    ...data
  };
};
