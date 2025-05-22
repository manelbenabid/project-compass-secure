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
  role: UserRole | 'lead' | 'support'; // Updated to accept POC team roles
  department: string;
  avatar?: string;
  skills?: string[];
  certificates?: string[];
  location?: UserLocation;
  status?: UserStatus;
  jobTitle?: string;
}

// Type for team members in POCs
export interface PocTeamMember extends Employee {
  role: 'lead' | 'support';
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

export type PocStatus = 
  | 'Account Manager coordinated with Tech Lead' 
  | 'Tech Lead reached the customer' 
  | 'Tech Lead assigned engineering team'
  | 'kickoff is done & scopes defined'
  | 'in progress'
  | 'customer pending'
  | 'Taqniyat pending'
  | 'done'
  | 'failed'
  | 'proposed'
  | 'in_progress'
  | 'completed'
  | 'archived';

export type PocTechnology = 
  | 'switching' 
  | 'routers' 
  | 'security'  
  | 'wireless' 
  | 'firewall' 
  | 'access points' 
  | 'webex communication' 
  | 'ip phones'  
  | 'AppDynamics' 
  | 'Security' 
  | 'Splunk' 
  | 'Webex Room Kits';

export interface Poc {
  id: string;
  title: string;
  description: string;
  status: PocStatus;
  technology: PocTechnology;
  customerId: string;
  customer?: Customer;
  startDate: string;
  endDate?: string;
  endTime?: string; // Added endTime property to match usage in PocDetailPage
  createdAt: string;
  updatedAt: string;
  leadId: string;
  accountManagerId: string;
  lead?: Employee;
  accountManager?: Employee;
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

// Customer creation type - defines the expected structure for creating a new customer
export interface CustomerCreate {
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  organization_type: string;
  website?: string;
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

const mockPocs: Poc[] = [
  {
    id: '1',
    title: 'AI-Powered Customer Service Bot',
    description: 'Develop a proof of concept for an AI chatbot that can handle basic customer service inquiries.',
    status: 'in progress',
    technology: 'AppDynamics',
    customerId: '1',
    customer: mockCustomers[0],
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2023-06-15T00:00:00Z',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    leadId: '2',
    accountManagerId: '5',
    lead: mockEmployees[1],
    accountManager: mockEmployees[4],
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
    status: 'Account Manager coordinated with Tech Lead',
    technology: 'security',
    customerId: '2',
    customer: mockCustomers[1],
    startDate: '2023-03-05T00:00:00Z',
    createdAt: '2023-03-05T08:45:00Z',
    updatedAt: '2023-03-05T08:45:00Z',
    leadId: '1',
    accountManagerId: '5',
    lead: mockEmployees[0],
    accountManager: mockEmployees[4],
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
    status: 'done',
    technology: 'wireless',
    customerId: '3',
    customer: mockCustomers[2],
    startDate: '2022-10-20T00:00:00Z',
    endDate: '2023-02-28T00:00:00Z',
    createdAt: '2022-10-20T13:15:00Z',
    updatedAt: '2023-02-28T15:10:00Z',
    leadId: '2',
    accountManagerId: '5',
    lead: mockEmployees[1],
    accountManager: mockEmployees[4],
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

export const getEmployeesByRole = async (role: UserRole): Promise<Employee[]> => {
  try {
    const result = await dbConnection.query('SELECT * FROM employees WHERE role = $1', [role]);
    if (result.rows && result.rows.length > 0) {
      return result.rows;
    }
    return mockEmployees.filter(emp => emp.role === role);
  } catch (error) {
    console.error(`Database error in getEmployeesByRole(${role}):`, error);
    return mockEmployees.filter(emp => emp.role === role);
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
        array_agg(DISTINCT pt.tag_name) FILTER (WHERE pt.tag_name IS NOT NULL) as tags,
        cust.id as customer_id,
        cust.name as customer_name,
        cust.contact_person,
        cust.contact_email,
        cust.contact_phone,
        cust.industry,
        cust.organization_type,
        lead.id as lead_id,
        lead.name as lead_name,
        lead.email as lead_email,
        lead.role as lead_role,
        lead.department as lead_department,
        lead.avatar as lead_avatar,
        am.id as account_manager_id,
        am.name as account_manager_name,
        am.email as account_manager_email,
        am.role as account_manager_role,
        am.department as account_manager_department,
        am.avatar as account_manager_avatar
      FROM 
        pocs p
      LEFT JOIN 
        poc_team pt ON p.id = pt.poc_id
      LEFT JOIN 
        employees t ON pt.employee_id = t.id
      LEFT JOIN 
        comments c ON p.id = c.poc_id
      LEFT JOIN
        customers cust ON p.customer_id = cust.id
      LEFT JOIN
        employees lead ON p.lead_id = lead.id
      LEFT JOIN
        employees am ON p.account_manager_id = am.id
      WHERE 
        p.id = $1
      GROUP BY 
        p.id, cust.id, lead.id, am.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const poc = result.rows[0];
    
    // Build customer object from joined data
    const customer = {
      id: poc.customer_id,
      name: poc.customer_name,
      contact_person: poc.contact_person,
      contact_email: poc.contact_email,
      contact_phone: poc.contact_phone,
      industry: poc.industry,
      organization_type: poc.organization_type
    };
    
    // Build lead object from joined data
    const lead = {
      id: poc.lead_id,
      name: poc.lead_name,
      email: poc.lead_email,
      role: poc.lead_role,
      department: poc.lead_department,
      avatar: poc.lead_avatar
    };
    
    // Build account manager object from joined data
    const accountManager = {
      id: poc.account_manager_id,
      name: poc.account_manager_name,
      email: poc.account_manager_email,
      role: poc.account_manager_role,
      department: poc.account_manager_department,
      avatar: poc.account_manager_avatar
    };
    
    return {
      ...poc,
      customer,
      lead,
      accountManager,
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
      INSERT INTO pocs (
        title, 
        description, 
        status, 
        technology,
        customer_id, 
        lead_id,
        account_manager_id,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, status, technology, customer_id, lead_id, account_manager_id, created_at, updated_at, start_date, end_date
    `, [
      poc.title, 
      poc.description, 
      poc.status, 
      poc.technology,
      poc.customerId,
      poc.leadId,
      poc.accountManagerId,
      poc.startDate,
      poc.endDate
    ]);
    
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
      customerId: newPoc.customer_id,
      leadId: newPoc.lead_id,
      accountManagerId: newPoc.account_manager_id,
      createdAt: newPoc.created_at,
      updatedAt: newPoc.updated_at,
      startDate: newPoc.start_date,
      endDate: newPoc.end_date,
      lead: poc.lead,
      accountManager: poc.accountManager,
      customer: poc.customer,
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
    
    if (poc.technology !== undefined) {
      updateFields.push(`technology = $${paramCount++}`);
      values.push(poc.technology);
    }
    
    if (poc.leadId !== undefined) {
      updateFields.push(`lead_id = $${paramCount++}`);
      values.push(poc.leadId);
    }
    
    if (poc.accountManagerId !== undefined) {
      updateFields.push(`account_manager_id = $${paramCount++}`);
      values.push(poc.accountManagerId);
    }
    
    if (poc.endDate !== undefined) {
      updateFields.push(`end_date = $${paramCount++}`);
      values.push(poc.endDate);
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

export const addComment = async (pocId: string, text: string, authorId: string): Promise<Comment | null> => {
  try {
    // Get author info
    const authorResult = await dbConnection.query('SELECT id, name, avatar FROM employees WHERE id = $1', [authorId]);
    if (authorResult.rows.length === 0) {
      throw new Error(`Author with ID ${authorId} not found`);
    }
    
    const author = authorResult.rows[0];
    
    // Insert comment
    const result = await dbConnection.query(`
      INSERT INTO comments (poc_id, text, author_id)
      VALUES ($1, $2, $3)
      RETURNING id, poc_id, text, created_at
    `, [pocId, text, authorId]);
    
    const comment = result.rows[0];
    
    return {
      id: comment.id,
      pocId: comment.poc_id,
      text: comment.text,
      createdAt: comment.created_at,
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar
      }
    };
  } catch (error) {
    console.error(`Database error in addComment(${pocId}, ${authorId}):`, error);
    
    // Fallback to mock implementation
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

export const createCustomer = async (customerData: CustomerCreate): Promise<Customer> => {
  try {
    // For mock implementation
    const mockCustomer: Customer = {
      id: `customer-${Date.now()}`, // Generate a unique ID
      name: customerData.name,
      contact_person: customerData.contact_person,
      contact_email: customerData.contact_email,
      contact_phone: customerData.contact_phone,
      industry: customerData.industry,
      organization_type: customerData.organization_type.toLowerCase() as CustomerType, // Cast to CustomerType
      website: customerData.website || null
    };

    // In a real implementation, you would make an API call here
    // const response = await axios.post('/api/customers', customerData);
    // return response.data;
    
    console.log('Created new customer:', mockCustomer);
    return mockCustomer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
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

export default api;
