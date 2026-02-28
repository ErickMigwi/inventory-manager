import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  supplier: string;
  reorderThreshold: number;
  branchId: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  profit: number;
  date: string;
  branchId: string;
  paymentMode?: 'cash' | 'mpesa' | 'credit';
  mpesaPhone?: string;
  paymentStatus?: 'settled' | 'credited'; // auto-settled for cash/mpesa, credited for credit sales
  creditName?: string; // name of debtor/customer for credit sales
  creditNotes?: string;
}

export interface CreditSale {
  id: string;
  saleId: string; // reference to the Sale record
  creditName: string;
  amount: number;
  dueDate: string; // due date for payment
  notes: string;
  branchId: string;
  createdDate: string;
  paidDate?: string; // when it was paid off
  isPaid: boolean;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
  branchId: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // if recurring
  recurringEndDate?: string; // null = indefinite
}

export interface ExpenseCategory {
  id: string;
  name: string;
}


interface AppContextType {
  user: User | null;
  currentBranch: string;
  branches: Branch[];
  products: Product[];
  sales: Sale[];
  users: User[];
  creditSales: CreditSale[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentBranch: (branchId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  restockProduct: (productId: string, quantity: number) => void;
  addCreditSale: (creditSale: Omit<CreditSale, 'id' | 'createdDate' | 'paidDate'>) => void;
  markCreditSalePaid: (creditSaleId: string) => void;
  deleteCreditSale: (creditSaleId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockBranches: Branch[] = [
  { id: '1', name: 'Main Branch', location: 'Nairobi CBD' },
  { id: '2', name: 'Westlands Branch', location: 'Westlands' },
  { id: '3', name: 'Kilimani Branch', location: 'Kilimani' },
];

const mockUsers: User[] = [
  { id: '1', name: 'John Kamau', email: 'john@shop.co.ke', role: 'admin', branchId: '1' },
  { id: '2', name: 'Mary Wanjiru', email: 'mary@shop.co.ke', role: 'staff', branchId: '1' },
  { id: '3', name: 'Peter Ochieng', email: 'peter@shop.co.ke', role: 'staff', branchId: '2' },
];

const mockProducts: Product[] = [
  { id: '1', name: 'Rice 5kg', costPrice: 450, sellingPrice: 650, quantity: 45, supplier: 'Mwea Rice Suppliers', reorderThreshold: 20, branchId: '1' },
  { id: '2', name: 'Sugar 2kg', costPrice: 180, sellingPrice: 250, quantity: 12, supplier: 'Mumias Sugar', reorderThreshold: 15, branchId: '1' },
  { id: '3', name: 'Cooking Oil 1L', costPrice: 220, sellingPrice: 320, quantity: 8, supplier: 'Fresh Oil Ltd', reorderThreshold: 10, branchId: '1' },
  { id: '4', name: 'Maize Flour 2kg', costPrice: 130, sellingPrice: 190, quantity: 55, supplier: 'Unga Group', reorderThreshold: 25, branchId: '1' },
  { id: '5', name: 'Tea Leaves 500g', costPrice: 280, sellingPrice: 380, quantity: 5, supplier: 'Kenya Tea Packers', reorderThreshold: 12, branchId: '1' },
  { id: '6', name: 'Milk 500ml', costPrice: 50, sellingPrice: 70, quantity: 65, supplier: 'Brookside Dairy', reorderThreshold: 30, branchId: '2' },
];

const mockSales: Sale[] = [
  { id: '1', productId: '1', productName: 'Rice 5kg', quantity: 3, revenue: 1950, profit: 600, date: '2026-02-22T10:30:00', branchId: '1', paymentMode: 'cash', paymentStatus: 'settled' },
  { id: '2', productId: '2', productName: 'Sugar 2kg', quantity: 5, revenue: 1250, profit: 350, date: '2026-02-22T11:15:00', branchId: '1', paymentMode: 'mpesa', mpesaPhone: '254712345678', paymentStatus: 'settled' },
  { id: '3', productId: '4', productName: 'Maize Flour 2kg', quantity: 8, revenue: 1520, profit: 480, date: '2026-02-22T09:45:00', branchId: '1', paymentMode: 'cash', paymentStatus: 'settled' },
  { id: '4', productId: '1', productName: 'Rice 5kg', quantity: 2, revenue: 1300, profit: 400, date: '2026-02-21T14:20:00', branchId: '1', paymentMode: 'cash', paymentStatus: 'settled' },
  { id: '5', productId: '3', productName: 'Cooking Oil 1L', quantity: 4, revenue: 1280, profit: 400, date: '2026-02-21T16:30:00', branchId: '1', paymentMode: 'mpesa', mpesaPhone: '254712345678', paymentStatus: 'settled' },
];

const defaultExpenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Rent' },
  { id: '2', name: 'Utilities' },
  { id: '3', name: 'Transport' },
  { id: '4', name: 'Supplies' },
  { id: '5', name: 'Staff Salary' },
  { id: '6', name: 'Marketing' },
  { id: '7', name: 'Maintenance' },
  { id: '8', name: 'Insurance' },
  { id: '9', name: 'Other' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string>('1');
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(defaultExpenseCategories);

  const login = async (email: string, _password: string) => {
    const foundUser = users.find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setCurrentBranch(foundUser.branchId);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => setUser(null);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...productUpdate } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = { ...sale, id: Date.now().toString(), date: new Date().toISOString() };
    setSales((prev) => [newSale, ...prev]);
    const product = products.find((p) => p.id === sale.productId);
    if (product) updateProduct(product.id, { quantity: product.quantity - sale.quantity });
  };

  const addBranch = (branch: Omit<Branch, 'id'>) => {
    setBranches((prev) => [...prev, { ...branch, id: Date.now().toString() }]);
  };

  const addUser = (userToAdd: Omit<User, 'id'>) => {
    setUsers((prev) => [...prev, { ...userToAdd, id: Date.now().toString() }]);
  };

  const updateUser = (id: string, userUpdate: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userUpdate } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const restockProduct = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) updateProduct(productId, { quantity: product.quantity + quantity });
  };

  const addCreditSale = (creditSale: Omit<CreditSale, 'id' | 'createdDate' | 'paidDate'>) => {
    const newCredit: CreditSale = {
      ...creditSale,
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      isPaid: false,
    };
    setCreditSales((prev) => [newCredit, ...prev]);
  };

  const markCreditSalePaid = (creditSaleId: string) => {
    setCreditSales((prev) =>
      prev.map((cs) =>
        cs.id === creditSaleId
          ? { ...cs, isPaid: true, paidDate: new Date().toISOString() }
          : cs
      )
    );
  };

  const deleteCreditSale = (creditSaleId: string) => {
    setCreditSales((prev) => prev.filter((cs) => cs.id !== creditSaleId));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [...prev, { ...expense, id: Date.now().toString() }]);
  };

  const updateExpense = (id: string, expenseUpdate: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseUpdate } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addExpenseCategory = (category: Omit<ExpenseCategory, 'id'>) => {
    setExpenseCategories((prev) => [...prev, { ...category, id: Date.now().toString() }]);
  };

  return (
    <AppContext.Provider value={{
      user, currentBranch, branches, products, sales, users, creditSales, expenses, expenseCategories,
      login, logout, setCurrentBranch, addProduct, updateProduct, deleteProduct,
      addSale, addBranch, addUser, updateUser, deleteUser, restockProduct,
      addCreditSale, markCreditSalePaid, deleteCreditSale,
      addExpense, updateExpense, deleteExpense, addExpenseCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
