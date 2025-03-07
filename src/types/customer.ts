export interface Customer {
  email: string;
  first_name: string;
  last_name: string;
  billing: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    state: string;
    phone: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country: string;
    state: string;
    phone: string;
  };
}
