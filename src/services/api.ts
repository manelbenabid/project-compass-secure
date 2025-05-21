import axios from 'axios';
import { UserRole, UserLocation, UserStatus } from '../contexts/AuthContext';
import dbConnection from './dbConfig';

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
  location?: UserLocation;
  status?: UserStatus;
  jobTitle?: string;
}

export interface Comment {
  id: string;
  pocId?: string;
  projectId?: string;
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

export type ProjectTechnology = 
  | 'switching' 
  | 'routers' 
  | 'security' 
  | 'wireless' 
  | 'firewall' 
  | 'access points' 
  | 'webex communication' 
  | 'ip phones' 
  | 'AppDynamics' 
  | 'Splunk' 
  | 'Webex Room Kits';

export type ProjectStatus = 
  | 'Account Manager coordinated with Tech Lead'
  | 'Teach Lead reach the customer'
  | 'Tech Lead assigned engineering team'
  | 'kickoff is done & scopes defined'
  | 'in progress'
  | 'customer pending'
  | 'Taqniyat pending'
  | 'done'
  | 'failed';

export interface Project {
  id: string;
  pocId?: string;
  customerId: string;
  customer?: Customer;
  title: string;
  technology: ProjectTechnology;
  status: ProjectStatus;
  leadId: string;
  lead?: Employee;
  accountManagerId: string;
  accountManager?: Employee;
  team: Employee[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
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

// Mock data (in a real app, this would be fetched from the server)
// These are kept as fallbacks in case the database connection fails
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

const mockProjects: Project[] = [
  {
    id: '1',
    pocId: '3',
    customerId: '1',
    customer: mockCustomers[0],
    title: 'Enterprise IoT Fleet Management System',
    technology: 'security',
    status: 'in progress',
    leadId: '2',
    lead: mockEmployees[1],
    accountManagerId: '5',
    accountManager: mockEmployees[4],
    team: [mockEmployees[0], mockEmployees[2], mockEmployees[3]],
    startDate: '2023-03-10T00:00:00Z',
    endDate: '2023-09-30T00:00:00Z',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
    comments: [
      {
        id: '101',
        projectId: '1',
        text: 'Kickoff meeting completed with the client. Project requirements finalized.',
        createdAt: '2023-03-15T10:00:00Z',
        author: {
          id: '5',
          name: 'Carol Williams',
          avatar: 'https://i.pravatar.cc/150?img=5'
        }
      },
      {
        id: '102',
        projectId: '1',
        text: 'Architecture design approved. Starting development phase.',
        createdAt: '2023-04-01T14:30:00Z',
        author: {
          id: '2',
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=2'
        }
      }
    ]
  }
];

// API methods with database integration
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const result = await dbConnection.query('SELECT * FROM employees');
    if (result.rows && result.rows.length > 0) {
      return result.rows;
    }
    // Fallback to mock data if no results
    console.log('Falling back to mock employee data');
    return mockEmployees;
  } catch (error) {
    console.error('Database error in getEmployees:', error);
    // Fallback to mock data if database connection fails
    console.log('Falling back to mock employee data');
    return mockEmployees;
  }
};

export const getPocs = async (): Promise<Poc[]> => {
  try {
    const result = await dbConnection.query(`
      SELECT 
        p.*,
        json_agg(DISTINCT t) as team,
        json_agg(DISTINCT c) FILTER (WHERE c.id IS NOT NULL) as comments,
        array_agg(DISTINCT pt.tag_name) FILTER (WHERE pt.tag_name IS NOT NULL) as tags
      FROM 
        pocs p
      LEFT JOIN 
        poc_team pt ON p.id = pt.poc_id
      LEFT JOIN 
        employees t ON pt.employee_id = t.id
      LEFT JOIN 
        comments c ON p.id = c.poc_id
      GROUP BY 
        p.id
    `);
    
    const pocs = result.rows.map(row => ({
      ...row,
      team: row.team || [],
      comments: row.comments[0] ? row.comments : [],
      tags: row.tags || []
    }));
    
    return pocs;
  } catch (error) {
    console.error('Database error in getPocs:', error);
    console.log('Falling back to mock POC data');
    return mockPocs;
  }
};

export const getPoc = async (id: string): Promise<Poc | null> => {
  try {
    const result = await dbConnection.query(`
      SELECT 
        p.*,
        json_agg(DISTINCT t) as team,
        json_agg(DISTINCT c) FILTER (WHERE c.id IS NOT NULL) as comments,
        array_agg(DISTINCT pt.tag_name) FILTER (WHERE pt.tag_name IS NOT NULL) as tags
      FROM 
        pocs p
      LEFT JOIN 
        poc_team pt ON p.id = pt.poc_id
      LEFT JOIN 
        employees t ON pt.employee_id = t.id
      LEFT JOIN 
        comments c ON p.id = c.poc_id
      WHERE 
        p.id = $1
      GROUP BY 
        p.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const poc = result.rows[0];
    return {
      ...poc,
      team: poc.team[0] ? poc.team : [],
      comments: poc.comments[0] ? poc.comments : [],
      tags: poc.tags || []
    };
  } catch (error) {
    console.error(`Database error in getPoc(${id}):`, error);
    const poc = mockPocs.find(p => p.id === id);
    return poc || null;
  }
};

export const createPoc = async (poc: Omit<Poc, 'id' | 'createdAt' | 'updatedAt'>): Promise<Poc> => {
  try {
    // Begin transaction
    await dbConnection.query('BEGIN');
    
    // Insert POC
    const pocResult = await dbConnection.query(`
      INSERT INTO pocs (title, description, status, lead_id, end_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, status, created_at, updated_at, end_time, lead_id
    `, [poc.title, poc.description, poc.status, poc.leadId, poc.endTime]);
    
    const newPoc = pocResult.rows[0];
    const pocId = newPoc.id;
    
    // Insert tags
    if (poc.tags && poc.tags.length > 0) {
      const tagValues = poc.tags.map((tag, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const tagParams = [pocId, ...poc.tags];
      
      await dbConnection.query(`
        INSERT INTO poc_tags (poc_id, tag_name)
        VALUES ${tagValues}
      `, tagParams);
    }
    
    // Insert team members
    if (poc.team && poc.team.length > 0) {
      const teamValues = poc.team.map((member, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const teamParams = [pocId, ...poc.team.map(member => member.id)];
      
      await dbConnection.query(`
        INSERT INTO poc_team (poc_id, employee_id)
        VALUES ${teamValues}
      `, teamParams);
    }
    
    // Commit transaction
    await dbConnection.query('COMMIT');
    
    // Return the complete POC
    return {
      ...newPoc,
      id: pocId,
      createdAt: newPoc.created_at,
      updatedAt: newPoc.updated_at,
      endTime: newPoc.end_time,
      leadId: newPoc.lead_id,
      lead: poc.lead,
      team: poc.team || [],
      comments: [],
      tags: poc.tags || []
    };
  } catch (error) {
    // Rollback transaction on error
    await dbConnection.query('ROLLBACK');
    console.error('Database error in createPoc:', error);
    
    // Fallback to mock implementation
    const newPoc: Poc = {
      ...poc,
      id: `${mockPocs.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    mockPocs.push(newPoc);
    return newPoc;
  }
};

export const updatePoc = async (id: string, poc: Partial<Poc>): Promise<Poc | null> => {
  try {
    // Start with building the update fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build the SET clause dynamically based on the provided fields
    if (poc.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(poc.title);
    }
    
    if (poc.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(poc.description);
    }
    
    if (poc.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(poc.status);
    }
    
    if (poc.leadId !== undefined) {
      updateFields.push(`lead_id = $${paramCount++}`);
      values.push(poc.leadId);
    }
    
    if (poc.endTime !== undefined) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(poc.endTime);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add the id parameter
    values.push(id);
    
    // Begin transaction
    await dbConnection.query('BEGIN');
    
    // Update POC
    if (updateFields.length > 0) {
      await dbConnection.query(`
        UPDATE pocs
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
      `, values);
    }
    
    // Update tags if provided
    if (poc.tags !== undefined) {
      // Delete existing tags
      await dbConnection.query('DELETE FROM poc_tags WHERE poc_id = $1', [id]);
      
      // Insert new tags
      if (poc.tags.length > 0) {
        const tagValues = poc.tags.map((tag, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const tagParams = [id, ...poc.tags];
        
        await dbConnection.query(`
          INSERT INTO poc_tags (poc_id, tag_name)
          VALUES ${tagValues}
        `, tagParams);
      }
    }
    
    // Update team members if provided
    if (poc.team !== undefined) {
      // Delete existing team members
      await dbConnection.query('DELETE FROM poc_team WHERE poc_id = $1', [id]);
      
      // Insert new team members
      if (poc.team.length > 0) {
        const teamValues = poc.team.map((member, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const teamParams = [id, ...poc.team.map(member => member.id)];
        
        await dbConnection.query(`
          INSERT INTO poc_team (poc_id, employee_id)
          VALUES ${teamValues}
        `, teamParams);
      }
    }
    
    // Commit transaction
    await dbConnection.query('COMMIT');
    
    // Get the updated POC
    return getPoc(id);
  } catch (error) {
    // Rollback transaction on error
    await dbConnection.query('ROLLBACK');
    console.error(`Database error in updatePoc(${id}):`, error);
    
    // Fallback to mock implementation
    const pocIndex = mockPocs.findIndex(p => p.id === id);
    if (pocIndex === -1) return null;
    
    mockPocs[pocIndex] = {
      ...mockPocs[pocIndex],
      ...poc,
      updatedAt: new Date().toISOString()
    };
    
    return mockPocs[pocIndex];
  }
};

export const addComment = async (
  resourceId: string, 
  text: string, 
  authorId: string, 
  resourceType: 'poc' | 'project' = 'poc'
): Promise<Comment | null> => {
  try {
    // Get author info
    const authorResult = await dbConnection.query('SELECT id, name, avatar FROM employees WHERE id = $1', [authorId]);
    if (authorResult.rows.length === 0) {
      throw new Error(`Author with ID ${authorId} not found`);
    }
    
    const author = authorResult.rows[0];
    
    // Insert comment based on resource type
    let result;
    if (resourceType === 'poc') {
      result = await dbConnection.query(`
        INSERT INTO comments (poc_id, text, author_id)
        VALUES ($1, $2, $3)
        RETURNING id, poc_id as "resourceId", text, created_at
      `, [resourceId, text, authorId]);
    } else {
      result = await dbConnection.query(`
        INSERT INTO comments (project_id, text, author_id)
        VALUES ($1, $2, $3)
        RETURNING id, project_id as "resourceId", text, created_at
      `, [resourceId, text, authorId]);
    }
    
    const comment = result.rows[0];
    
    return {
      id: comment.id,
      [resourceType === 'poc' ? 'pocId' : 'projectId']: comment.resourceId,
      text: comment.text,
      createdAt: comment.created_at,
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar
      }
    };
  } catch (error) {
    console.error(`Database error in addComment(${resourceId}, ${authorId}):`, error);
    
    // Fallback to mock implementation
    if (resourceType === 'poc') {
      const poc = mockPocs.find(p => p.id === resourceId);
      if (!poc) return null;
      
      const author = mockEmployees.find(e => e.id === authorId);
      if (!author) return null;
      
      const newComment: Comment = {
        id: `${Date.now()}`,
        pocId: resourceId,
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
    } else {
      const project = mockProjects.find(p => p.id === resourceId);
      if (!project) return null;
      
      const author = mockEmployees.find(e => e.id === authorId);
      if (!author) return null;
      
      const newComment: Comment = {
        id: `${Date.now()}`,
        projectId: resourceId,
        text,
        createdAt: new Date().toISOString(),
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar
        }
      };
      
      project.comments.push(newComment);
      return newComment;
    }
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const result = await dbConnection.query('SELECT * FROM customers');
    return result.rows;
  } catch (error) {
    console.error('Database error in getCustomers:', error);
    return mockCustomers;
  }
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
  try {
    const result = await dbConnection.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Database error in getCustomer(${id}):`, error);
    const customer = mockCustomers.find(c => c.id === id);
    return customer || null;
  }
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer | null> => {
  try {
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle arrays separately (skills, certificates)
        if (Array.isArray(value)) {
          updates.push(`${key} = $${paramCount++}`);
          values.push(value);
        } else {
          updates.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) {
      return getCustomer(id); // Nothing to update
    }
    
    values.push(id); // Add id as the last parameter
    
    const result = await dbConnection.query(`
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Database error in updateCustomer(${id}):`, error);
    
    // Fallback to mock implementation
    const customerIndex = mockCustomers.findIndex(c => c.id === id);
    if (customerIndex === -1) return null;
    
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...data
    };
    
    return mockCustomers[customerIndex];
  }
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    const result = await dbConnection.query(`
      INSERT INTO customers (name, contact_person, contact_email, contact_phone, industry, organization_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      customer.name,
      customer.contact_person,
      customer.contact_email,
      customer.contact_phone,
      customer.industry,
      customer.organization_type
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Database error in createCustomer:', error);
    
    // Fallback to mock implementation
    const newCustomer: Customer = {
      ...customer,
      id: `${mockCustomers.length + 1}`
    };
    
    mockCustomers.push(newCustomer);
    return newCustomer;
  }
};

export const updateEmployeeInfo = async (id: string, data: Partial<Employee>): Promise<Employee | null> => {
  try {
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle arrays separately (skills, certificates)
        if (Array.isArray(value)) {
          updates.push(`${key} = $${paramCount++}`);
          values.push(value);
        } else {
          updates.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) {
      return null; // Nothing to update
    }
    
    values.push(id); // Add id as the last parameter
    
    const result = await dbConnection.query(`
      UPDATE employees
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Database error in updateEmployeeInfo(${id}):`, error);
    
    // Fallback to mock implementation
    const employeeIndex = mockEmployees.findIndex(e => e.id === id);
    if (employeeIndex === -1) return null;
    
    mockEmployees[employeeIndex] = {
      ...mockEmployees[employeeIndex],
      ...data
    };
    
    return mockEmployees[employeeIndex];
  }
};

// Projects API methods
export const getProjects = async (): Promise<Project[]> => {
  try {
    const result = await dbConnection.query(`
      SELECT 
        p.*,
        c.name as customer_name,
        c.contact_person as customer_contact_person,
        c.contact_email as customer_contact_email,
        c.contact_phone as customer_contact_phone,
        c.industry as customer_industry,
        c.organization_type as customer_organization_type,
        el.name as lead_name,
        el.avatar as lead_avatar,
        el.email as lead_email,
        el.role as lead_role,
        ea.name as account_manager_name,
        ea.avatar as account_manager_avatar,
        ea.email as account_manager_email,
        ea.role as account_manager_role,
        json_agg(DISTINCT et) FILTER (WHERE et.id IS NOT NULL) as team,
        json_agg(DISTINCT cm) FILTER (WHERE cm.id IS NOT NULL) as comments
      FROM 
        projects p
      LEFT JOIN 
        customers c ON p.customer_id = c.id
      LEFT JOIN 
        employees el ON p.lead_id = el.id
      LEFT JOIN 
        employees ea ON p.account_manager_id = ea.id
      LEFT JOIN 
        project_team pt ON p.id = pt.project_id
      LEFT JOIN 
        employees et ON pt.employee_id = et.id
      LEFT JOIN 
        comments cm ON p.id = cm.project_id
      GROUP BY 
        p.id, c.id, el.id, ea.id
    `);
    
    const projects = result.rows.map(row => {
      const customer = {
        id: row.customer_id,
        name: row.customer_name,
        contact_person: row.customer_contact_person,
        contact_email: row.customer_contact_email,
        contact_phone: row.customer_contact_phone,
        industry: row.customer_industry,
        organization_type: row.customer_organization_type
      };
      
      const lead = row.lead_id ? {
        id: row.lead_id,
        name: row.lead_name,
        avatar: row.lead_avatar,
        email: row.lead_email,
        role: row.lead_role,
        department: 'Engineering' // Default value, should be fetched from DB
      } : undefined;
      
      const accountManager = row.account_manager_id ? {
        id: row.account_manager_id,
        name: row.account_manager_name,
        avatar: row.account_manager_avatar,
        email: row.account_manager_email,
        role: row.account_manager_role,
        department: 'Sales' // Default value, should be fetched from DB
      } : undefined;

      return {
        id: row.id,
        pocId: row.poc_id,
        customerId: row.customer_id,
        customer,
        title: row.title,
        technology: row.technology,
        status: row.status,
        leadId: row.lead_id,
        lead,
        accountManagerId: row.account_manager_id,
        accountManager,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        team: row.team && row.team[0] ? row.team.filter(Boolean) : [],
        comments: row.comments && row.comments[0] ? row.comments.filter(Boolean).map(c => ({
          id: c.id,
          projectId: c.project_id,
          text: c.text,
          createdAt: c.created_at,
          author: {
            id: c.author_id,
            name: c.author_name || 'Unknown',
            avatar: c.author_avatar
          }
        })) : []
      };
    });
    
    return projects;
  } catch (error) {
    console.error('Database error in getProjects:', error);
    console.log('Falling back to mock project data');
    return mockProjects;
  }
};

export const getProject = async (id: string): Promise<Project | null> => {
  try {
    const result = await dbConnection.query(`
      SELECT 
        p.*,
        c.name as customer_name,
        c.contact_person as customer_contact_person,
        c.contact_email as customer_contact_email,
        c.contact_phone as customer_contact_phone,
        c.industry as customer_industry,
        c.organization_type as customer_organization_type,
        el.name as lead_name,
        el.avatar as lead_avatar,
        el.email as lead_email,
        el.role as lead_role,
        ea.name as account_manager_name,
        ea.avatar as account_manager_avatar,
        ea.email as account_manager_email,
        ea.role as account_manager_role,
        json_agg(DISTINCT et) FILTER (WHERE et.id IS NOT NULL) as team,
        json_agg(DISTINCT cm) FILTER (WHERE cm.id IS NOT NULL) as comments
      FROM 
        projects p
      LEFT JOIN 
        customers c ON p.customer_id = c.id
      LEFT JOIN 
        employees el ON p.lead_id = el.id
      LEFT JOIN 
        employees ea ON p.account_manager_id = ea.id
      LEFT JOIN 
        project_team pt ON p.id = pt.project_id
      LEFT JOIN 
        employees et ON pt.employee_id = et.id
      LEFT JOIN 
        comments cm ON p.id = cm.project_id
      WHERE 
        p.id = $1
      GROUP BY 
        p.id, c.id, el.id, ea.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    const customer = {
      id: row.customer_id,
      name: row.customer_name,
      contact_person: row.customer_contact_person,
      contact_email: row.customer_contact_email,
      contact_phone: row.customer_contact_phone,
      industry: row.customer_industry,
      organization_type: row.customer_organization_type
    };
    
    const lead = row.lead_id ? {
      id: row.lead_id,
      name: row.lead_name,
      avatar: row.lead_avatar,
      email: row.lead_email,
      role: row.lead_role,
      department: 'Engineering' // Default value, should be fetched from DB
    } : undefined;
    
    const accountManager = row.account_manager_id ? {
      id: row.account_manager_id,
      name: row.account_manager_name,
      avatar: row.account_manager_avatar,
      email: row.account_manager_email,
      role: row.account_manager_role,
      department: 'Sales' // Default value, should be fetched from DB
    } : undefined;

    return {
      id: row.id,
      pocId: row.poc_id,
      customerId: row.customer_id,
      customer,
      title: row.title,
      technology: row.technology,
      status: row.status,
      leadId: row.lead_id,
      lead,
      accountManagerId: row.account_manager_id,
      accountManager,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      team: row.team && row.team[0] ? row.team.filter(Boolean) : [],
      comments: row.comments && row.comments[0] ? row.comments.filter(Boolean).map(c => ({
        id: c.id,
        projectId: c.project_id,
        text: c.text,
        createdAt: c.created_at,
        author: {
          id: c.author_id,
          name: c.author_name || 'Unknown',
          avatar: c.author_avatar
        }
      })) : []
    };
  } catch (error) {
    console.error(`Database error in getProject(${id}):`, error);
    const project = mockProjects.find(p => p.id === id);
    return project || null;
  }
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<Project> => {
  try {
    // Begin transaction
    await dbConnection.query('BEGIN');
    
    // Insert project
    const projectResult = await dbConnection.query(`
      INSERT INTO projects (poc_id, customer_id, title, technology, status, lead_id, account_manager_id, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, poc_id, customer_id, title, technology, status, lead_id, account_manager_id, start_date, end_date, created_at, updated_at
    `, [
      project.pocId || null, 
      project.customerId, 
      project.title, 
      project.technology, 
      project.status, 
      project.leadId, 
      project.accountManagerId, 
      project.startDate, 
      project.endDate || null
    ]);
    
    const newProject = projectResult.rows[0];
    const projectId = newProject.id;
    
    // Insert team members
    if (project.team && project.team.length > 0) {
      const teamValues = project.team.map((member, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const teamParams = [projectId, ...project.team.map(member => member.id)];
      
      await dbConnection.query(`
        INSERT INTO project_team (project_id, employee_id)
        VALUES ${teamValues}
      `, teamParams);
    }
    
    // Commit transaction
    await dbConnection.query('COMMIT');
    
    // Get the full project with relations
    return getProject(projectId) as Promise<Project>;
  } catch (error) {
    // Rollback transaction on error
    await dbConnection.query('ROLLBACK');
    console.error('Database error in createProject:', error);
    
    // Fallback to mock implementation
    const newProject: Project = {
      ...project,
      id: `${mockProjects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    mockProjects.push(newProject);
    return newProject;
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project | null> => {
  try {
    // Start with building the update fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Build the SET clause dynamically based on the provided fields
    if (project.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(project.title);
    }
    
    if (project.technology !== undefined) {
      updateFields.push(`technology = $${paramCount++}`);
      values.push(project.technology);
    }
    
    if (project.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(project.status);
    }
    
    if (project.leadId !== undefined) {
      updateFields.push(`lead_id = $${paramCount++}`);
      values.push(project.leadId);
    }
    
    if (project.accountManagerId !== undefined) {
      updateFields.push(`account_manager_id = $${paramCount++}`);
      values.push(project.accountManagerId);
    }
    
    if (project.endDate !== undefined) {
      updateFields.push(`end_date = $${paramCount++}`);
      values.push(project.endDate);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add the id parameter
    values.push(id);
    
    // Begin transaction
    await dbConnection.query('BEGIN');
    
    // Update project
    if (updateFields.length > 0) {
      await dbConnection.query(`
        UPDATE projects
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
      `, values);
    }
    
    // Update team members if provided
    if (project.team !== undefined) {
      // Delete existing team members
      await dbConnection.query('DELETE FROM project_team WHERE project_id = $1', [id]);
      
      // Insert new team members
      if (project.team.length > 0) {
        const teamValues = project.team.map((member, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const teamParams = [id, ...project.team.map(member => member.id)];
        
        await dbConnection.query(`
          INSERT INTO project_team (project_id, employee_id)
          VALUES ${teamValues}
        `, teamParams);
      }
    }
    
    // Commit transaction
    await dbConnection.query('COMMIT');
    
    // Get the updated project
    return getProject(id);
  } catch (error) {
    // Rollback transaction on error
    await dbConnection.query('ROLLBACK');
    console.error(`Database error in updateProject(${id}):`, error);
    
    // Fallback to mock implementation
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;
    
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...project,
      updatedAt: new Date().toISOString()
    };
    
    return mockProjects[projectIndex];
  }
};

export default api;
