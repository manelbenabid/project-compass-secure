import axios from 'axios';
import { UserRole } from '../contexts/AuthContext';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor to add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('kc-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  workExtension?: string;
  role: UserRole;
  department: string;
  avatar?: string;
  skills?: string[];
  certificates?: string[];
  location?: 'remote' | 'in-office' | 'on-site' | 'off-site';
  status?: 'active' | 'on leave' | 'other';
  jobTitle?: string;
}

export interface Comment {
  id: string;
  pocId: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export type PocStatus = 'proposed' | 'in_progress' | 'completed' | 'archived';

export interface Poc {
  id: string;
  title: string;
  description: string;
  status: PocStatus;
  createdAt: string;
  updatedAt: string;
  endTime?: string;
  leadId: string;
  lead?: Employee;
  team: Employee[];
  comments: Comment[];
  tags: string[];
}

export type CustomerType = 'private' | 'governmental' | 'semi-private';

export interface Customer {
  id: string;
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  organization_type: CustomerType;
}

export type UserRole = 'admin' | 'lead' | 'developer' | 'account_manager';

// Mock data (in a real app, this would be fetched from the server)
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '555-123-4567',
    workExtension: '1234',
    role: 'admin',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: ['React', 'TypeScript', 'Node.js'],
    certificates: ['AWS Certified Developer', 'Scrum Master'],
    location: 'in-office',
    status: 'active',
    jobTitle: 'Senior Developer'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '555-987-6543',
    workExtension: '4321',
    role: 'lead',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?img=2',
    skills: ['JavaScript', 'React', 'Python'],
    certificates: ['Azure Developer Associate'],
    location: 'remote',
    status: 'active',
    jobTitle: 'Team Lead'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'developer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '4',
    name: 'Bob Brown',
    email: 'bob@company.com',
    role: 'developer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: '5',
    name: 'Carol Williams',
    email: 'carol@company.com',
    role: 'account_manager',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

const mockPocs: Poc[] = [
  {
    id: '1',
    title: 'AI-Powered Customer Service Bot',
    description: 'Develop a proof of concept for an AI chatbot that can handle basic customer service inquiries.',
    status: 'in_progress',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    endTime: '2023-06-15T10:30:00Z',
    leadId: '2',
    team: [mockEmployees[0], mockEmployees[2], mockEmployees[3]],
    comments: [
      {
        id: '1',
        pocId: '1',
        text: 'Initial prototype completed, moving to testing phase.',
        createdAt: '2023-02-01T09:15:00Z',
        author: {
          id: '2',
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=2'
        }
      },
      {
        id: '2',
        pocId: '1',
        text: 'Testing phase showing promising results. Need to improve response accuracy.',
        createdAt: '2023-03-10T11:20:00Z',
        author: {
          id: '3',
          name: 'Alice Johnson',
          avatar: 'https://i.pravatar.cc/150?img=3'
        }
      }
    ],
    tags: ['AI', 'Customer Service', 'Chatbot']
  },
  {
    id: '2',
    title: 'Blockchain-based Document Verification',
    description: 'Create a POC for verifying document authenticity using blockchain technology.',
    status: 'proposed',
    createdAt: '2023-03-05T08:45:00Z',
    updatedAt: '2023-03-05T08:45:00Z',
    leadId: '1',
    team: [mockEmployees[1], mockEmployees[3]],
    comments: [
      {
        id: '3',
        pocId: '2',
        text: 'Project proposal approved. Starting requirements gathering.',
        createdAt: '2023-03-05T09:30:00Z',
        author: {
          id: '1',
          name: 'Jane Smith',
          avatar: 'https://i.pravatar.cc/150?img=1'
        }
      }
    ],
    tags: ['Blockchain', 'Document Verification', 'Security']
  },
  {
    id: '3',
    title: 'IoT Fleet Management System',
    description: 'Develop a system for tracking and managing delivery vehicles using IoT sensors.',
    status: 'completed',
    createdAt: '2022-10-20T13:15:00Z',
    updatedAt: '2023-02-28T15:10:00Z',
    leadId: '2',
    team: [mockEmployees[0], mockEmployees[2]],
    comments: [
      {
        id: '4',
        pocId: '3',
        text: 'All features implemented and tested. Ready for client demo.',
        createdAt: '2023-02-15T10:45:00Z',
        author: {
          id: '2',
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=2'
        }
      },
      {
        id: '5',
        pocId: '3',
        text: 'Client demo successful. POC approved for production development.',
        createdAt: '2023-02-28T15:10:00Z',
        author: {
          id: '5',
          name: 'Carol Williams',
          avatar: 'https://i.pravatar.cc/150?img=5'
        }
      }
    ],
    tags: ['IoT', 'Fleet Management', 'Logistics']
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    contact_person: 'Wile E. Coyote',
    contact_email: 'wcoyote@acme.com',
    contact_phone: '555-123-4567',
    industry: 'Manufacturing',
    organization_type: 'private'
  },
  {
    id: '2',
    name: 'Wayne Enterprises',
    contact_person: 'Bruce Wayne',
    contact_email: 'bruce@wayne.com',
    contact_phone: '555-876-5432',
    industry: 'Technology',
    organization_type: 'private'
  },
  {
    id: '3',
    name: 'City of Metropolis',
    contact_person: 'Mayor Office',
    contact_email: 'mayor@metropolis.gov',
    contact_phone: '555-789-0123',
    industry: 'Government',
    organization_type: 'governmental'
  }
];

// API methods
export const getEmployees = async (): Promise<Employee[]> => {
  return mockEmployees;
};

export const getPocs = async (): Promise<Poc[]> => {
  return mockPocs;
};

export const getPoc = async (id: string): Promise<Poc | null> => {
  const poc = mockPocs.find(p => p.id === id);
  return poc || null;
};

export const createPoc = async (poc: Omit<Poc, 'id' | 'createdAt' | 'updatedAt'>): Promise<Poc> => {
  const newPoc: Poc = {
    ...poc,
    id: `${mockPocs.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: []
  };
  mockPocs.push(newPoc);
  return newPoc;
};

export const updatePoc = async (id: string, poc: Partial<Poc>): Promise<Poc | null> => {
  const pocIndex = mockPocs.findIndex(p => p.id === id);
  if (pocIndex === -1) return null;
  
  mockPocs[pocIndex] = {
    ...mockPocs[pocIndex],
    ...poc,
    updatedAt: new Date().toISOString()
  };
  
  return mockPocs[pocIndex];
};

export const addComment = async (pocId: string, text: string, authorId: string): Promise<Comment | null> => {
  const poc = mockPocs.find(p => p.id === pocId);
  if (!poc) return null;
  
  const author = mockEmployees.find(e => e.id === authorId);
  if (!author) return null;
  
  const newComment: Comment = {
    id: `${Date.now()}`,
    pocId,
    text,
    createdAt: new Date().toISOString(),
    author: {
      id: author.id,
      name: author.name,
      avatar: author.avatar
    }
  };
  
  poc.comments.push(newComment);
  return newComment;
};

export const getCustomers = async (): Promise<Customer[]> => {
  return mockCustomers;
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
  const customer = mockCustomers.find(c => c.id === id);
  return customer || null;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer | null> => {
  const customerIndex = mockCustomers.findIndex(c => c.id === id);
  if (customerIndex === -1) return null;
  
  mockCustomers[customerIndex] = {
    ...mockCustomers[customerIndex],
    ...data
  };
  
  return mockCustomers[customerIndex];
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const newCustomer: Customer = {
    ...customer,
    id: `${mockCustomers.length + 1}`
  };
  
  mockCustomers.push(newCustomer);
  return newCustomer;
};

export const updateEmployeeInfo = async (id: string, data: Partial<Employee>): Promise<Employee | null> => {
  const employeeIndex = mockEmployees.findIndex(e => e.id === id);
  if (employeeIndex === -1) return null;
  
  mockEmployees[employeeIndex] = {
    ...mockEmployees[employeeIndex],
    ...data
  };
  
  return mockEmployees[employeeIndex];
};

export default api;
