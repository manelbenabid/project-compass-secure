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
