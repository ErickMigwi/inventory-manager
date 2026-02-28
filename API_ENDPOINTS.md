# API Endpoints Documentation

## Overview
This document details all API endpoints required for the Inventory Management System application. Endpoints are organized by feature module with complete request/response specifications and database schema information.

**Application Features:**
- User authentication and management
- Multi-branch inventory management
- Product management (CRUD)
- Sales recording and tracking
- Credit sales (debtors) management
- Expense tracking with recurring support
- Damaged goods tracking
- Financial reports and analytics
- Payment reconciliation

---

## Database Schema

### 1. Users Table
**Table Name:** `users`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Unique email |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| name | VARCHAR(255) | NOT NULL | User's full name |
| role | ENUM | NOT NULL | 'admin' or 'staff' |
| branchId | UUID/String | FK→branches.id | User's assigned branch |
| createdAt | TIMESTAMP | NOT NULL | Account creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |
| isActive | BOOLEAN | DEFAULT true | Account status |

---

### 2. Branches Table
**Table Name:** `branches`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Branch name |
| location | VARCHAR(255) | NOT NULL | Physical location |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

---

### 3. Products Table
**Table Name:** `products`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Product name |
| costPrice | DECIMAL(10,2) | NOT NULL | Cost price per unit |
| sellingPrice | DECIMAL(10,2) | NOT NULL | Selling price per unit |
| quantity | INT | NOT NULL DEFAULT 0 | Current stock quantity |
| supplier | VARCHAR(255) | NOT NULL | Supplier name |
| reorderThreshold | INT | NOT NULL | Alert threshold for low stock |
| branchId | UUID/String | FK→branches.id NOT NULL | Product's branch |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

---

### 4. Sales Table
**Table Name:** `sales`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| productId | UUID/String | FK→products.id NOT NULL | Sold product |
| productName | VARCHAR(255) | NOT NULL | Denormalized product name |
| quantity | INT | NOT NULL | Units sold |
| revenue | DECIMAL(10,2) | NOT NULL | Total revenue (qty × price) |
| profit | DECIMAL(10,2) | NOT NULL | Total profit (qty × (selling-cost)) |
| date | TIMESTAMP | NOT NULL | Sale date/time |
| branchId | UUID/String | FK→branches.id NOT NULL | Sale's branch |
| paymentMode | ENUM | NOT NULL | 'cash', 'mpesa', or 'credit' |
| mpesaPhone | VARCHAR(20) | NULLABLE | M-Pesa phone number |
| paymentStatus | ENUM | NOT NULL | 'settled' or 'credited' |
| creditName | VARCHAR(255) | NULLABLE | Customer name for credit sales |
| creditNotes | TEXT | NULLABLE | Notes for credit sales |
| createdAt | TIMESTAMP | NOT NULL | Record creation date |

---

### 5. Credit Sales Table
**Table Name:** `creditSales`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| saleId | UUID/String | FK→sales.id NOT NULL | Reference to sale record |
| creditName | VARCHAR(255) | NOT NULL | Debtor/Customer name |
| amount | DECIMAL(10,2) | NOT NULL | Credit amount owed |
| dueDate | DATE | NOT NULL | Payment due date |
| notes | TEXT | NULLABLE | Additional notes |
| branchId | UUID/String | FK→branches.id NOT NULL | Credit's branch |
| createdDate | TIMESTAMP | NOT NULL | Credit creation date |
| paidDate | TIMESTAMP | NULLABLE | When payment received |
| isPaid | BOOLEAN | DEFAULT false | Payment status |
| createdAt | TIMESTAMP | NOT NULL | Record creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

---

### 6. Expenses Table
**Table Name:** `expenses`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| category | VARCHAR(255) | FK→expenseCategories.name NOT NULL | Expense category |
| amount | DECIMAL(10,2) | NOT NULL | Expense amount |
| date | DATE | NOT NULL | Expense date |
| notes | TEXT | NULLABLE | Expense description |
| branchId | UUID/String | FK→branches.id NOT NULL | Expense's branch |
| isRecurring | BOOLEAN | DEFAULT false | Is recurring expense |
| recurringFrequency | ENUM | NULLABLE | 'daily', 'weekly', 'monthly', 'yearly' |
| recurringEndDate | DATE | NULLABLE | When recurrence ends (null = indefinite) |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

---

### 7. Expense Categories Table
**Table Name:** `expenseCategories`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Category name |
| createdAt | TIMESTAMP | NOT NULL | Creation date |

**Default Categories:**
1. Rent
2. Utilities
3. Transport
4. Supplies
5. Staff Salary
6. Marketing
7. Maintenance
8. Insurance
9. Other

---

### 8. Damaged Goods Table
**Table Name:** `damagedGoods`

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| id | UUID/String | PRIMARY KEY | Unique identifier |
| productId | UUID/String | FK→products.id NOT NULL | Damaged product |
| productName | VARCHAR(255) | NOT NULL | Denormalized product name |
| quantity | INT | NOT NULL | Units damaged |
| reason | TEXT | NOT NULL | Reason for damage |
| date | DATE | NOT NULL | Date recorded |
| branchId | UUID/String | FK→branches.id NOT NULL | Damaged goods' branch |
| createdAt | TIMESTAMP | NOT NULL | Record creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

---

## API Endpoints

### Authentication Module

#### 1. Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "john@shop.co.ke",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u-123",
      "name": "John Kamau",
      "email": "john@shop.co.ke",
      "role": "admin",
      "branchId": "b-1"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

---

#### 2. Logout
```
POST /api/auth/logout
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 3. Refresh Token
```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### User Management Module

#### 1. Get All Users
```
GET /api/users
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `role` (optional) - Filter by role ('admin' or 'staff')
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "u-1",
        "name": "John Kamau",
        "email": "john@shop.co.ke",
        "role": "admin",
        "branchId": "b-1",
        "isActive": true,
        "createdAt": "2026-02-01T10:00:00Z"
      },
      {
        "id": "u-2",
        "name": "Mary Wanjiru",
        "email": "mary@shop.co.ke",
        "role": "staff",
        "branchId": "b-1",
        "isActive": true,
        "createdAt": "2026-02-02T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2
    }
  }
}
```

---

#### 2. Get User by ID
```
GET /api/users/:userId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "u-1",
    "name": "John Kamau",
    "email": "john@shop.co.ke",
    "role": "admin",
    "branchId": "b-1",
    "isActive": true,
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-15T14:30:00Z"
  }
}
```

---

#### 3. Create User
```
POST /api/users
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Peter Ochieng",
  "email": "peter@shop.co.ke",
  "password": "securepass123",
  "role": "staff",
  "branchId": "b-2"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "u-3",
    "name": "Peter Ochieng",
    "email": "peter@shop.co.ke",
    "role": "staff",
    "branchId": "b-2",
    "isActive": true,
    "createdAt": "2026-02-28T09:45:00Z"
  }
}
```

**Response (Error - 409):**
```json
{
  "success": false,
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

---

#### 4. Update User
```
PUT /api/users/:userId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Peter O. Ochieng",
  "role": "admin",
  "isActive": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "u-3",
    "name": "Peter O. Ochieng",
    "email": "peter@shop.co.ke",
    "role": "admin",
    "branchId": "b-2",
    "isActive": true,
    "updatedAt": "2026-02-28T10:00:00Z"
  }
}
```

---

#### 5. Delete User
```
DELETE /api/users/:userId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "u-3"
  }
}
```

---

### Branch Management Module

#### 1. Get All Branches
```
GET /api/branches
```

**Query Parameters:**
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "id": "b-1",
        "name": "Main Branch",
        "location": "Nairobi CBD",
        "createdAt": "2026-01-10T08:00:00Z"
      },
      {
        "id": "b-2",
        "name": "Westlands Branch",
        "location": "Westlands",
        "createdAt": "2026-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2
    }
  }
}
```

---

#### 2. Get Branch by ID
```
GET /api/branches/:branchId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "b-1",
    "name": "Main Branch",
    "location": "Nairobi CBD",
    "createdAt": "2026-01-10T08:00:00Z",
    "updatedAt": "2026-02-20T15:30:00Z"
  }
}
```

---

#### 3. Create Branch
```
POST /api/branches
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Kilimani Branch",
  "location": "Kilimani"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "b-3",
    "name": "Kilimani Branch",
    "location": "Kilimani",
    "createdAt": "2026-02-28T11:15:00Z"
  }
}
```

---

#### 4. Update Branch
```
PUT /api/branches/:branchId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Main Branch Updated",
  "location": "Nairobi CBD - Downtown"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "b-1",
    "name": "Main Branch Updated",
    "location": "Nairobi CBD - Downtown",
    "updatedAt": "2026-02-28T11:20:00Z"
  }
}
```

---

#### 5. Delete Branch
```
DELETE /api/branches/:branchId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Note:** Only allowed if no users or products are assigned to the branch.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Branch deleted successfully",
  "data": {
    "id": "b-3"
  }
}
```

---

### Product Management Module

#### 1. Get All Products
```
GET /api/products
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `search` (optional) - Search by product name
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `lowStock` (optional) - Boolean to show only low stock items

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "p-1",
        "name": "Rice 5kg",
        "costPrice": 450,
        "sellingPrice": 650,
        "quantity": 45,
        "supplier": "Mwea Rice Suppliers",
        "reorderThreshold": 20,
        "branchId": "b-1",
        "profit": 200,
        "inventoryValue": 29250,
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

#### 2. Get Product by ID
```
GET /api/products/:productId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "p-1",
    "name": "Rice 5kg",
    "costPrice": 450,
    "sellingPrice": 650,
    "quantity": 45,
    "supplier": "Mwea Rice Suppliers",
    "reorderThreshold": 20,
    "branchId": "b-1",
    "profit": 200,
    "inventoryValue": 29250,
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-25T14:30:00Z"
  }
}
```

---

#### 3. Create Product
```
POST /api/products
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Beans 2kg",
  "costPrice": 280,
  "sellingPrice": 420,
  "quantity": 30,
  "supplier": "Kenya Beans Co.",
  "reorderThreshold": 15,
  "branchId": "b-1"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "p-7",
    "name": "Beans 2kg",
    "costPrice": 280,
    "sellingPrice": 420,
    "quantity": 30,
    "supplier": "Kenya Beans Co.",
    "reorderThreshold": 15,
    "branchId": "b-1",
    "profit": 140,
    "inventoryValue": 12600,
    "createdAt": "2026-02-28T12:00:00Z"
  }
}
```

---

#### 4. Update Product
```
PUT /api/products/:productId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "quantity": 50,
  "sellingPrice": 700,
  "reorderThreshold": 25
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "p-1",
    "name": "Rice 5kg",
    "costPrice": 450,
    "sellingPrice": 700,
    "quantity": 50,
    "supplier": "Mwea Rice Suppliers",
    "reorderThreshold": 25,
    "branchId": "b-1",
    "profit": 250,
    "inventoryValue": 35000,
    "updatedAt": "2026-02-28T12:05:00Z"
  }
}
```

---

#### 5. Delete Product
```
DELETE /api/products/:productId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "p-7"
  }
}
```

---

### Sales Management Module

#### 1. Get All Sales
```
GET /api/sales
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `paymentMode` (optional) - Filter by payment mode ('cash', 'mpesa', 'credit')
- `paymentStatus` (optional) - Filter by status ('settled', 'credited')
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": "s-1",
        "productId": "p-1",
        "productName": "Rice 5kg",
        "quantity": 3,
        "revenue": 1950,
        "profit": 600,
        "date": "2026-02-22T10:30:00Z",
        "branchId": "b-1",
        "paymentMode": "cash",
        "paymentStatus": "settled",
        "mpesaPhone": null,
        "creditName": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

#### 2. Get Sale by ID
```
GET /api/sales/:saleId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "s-1",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 3,
    "revenue": 1950,
    "profit": 600,
    "date": "2026-02-22T10:30:00Z",
    "branchId": "b-1",
    "paymentMode": "cash",
    "paymentStatus": "settled",
    "mpesaPhone": null,
    "creditName": null,
    "creditNotes": null,
    "createdAt": "2026-02-22T10:30:00Z"
  }
}
```

---

#### 3. Create Sale (Record Sale)
```
POST /api/sales
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "productId": "p-1",
  "productName": "Rice 5kg",
  "quantity": 2,
  "revenue": 1300,
  "profit": 400,
  "branchId": "b-1",
  "paymentMode": "cash",
  "paymentStatus": "settled",
  "mpesaPhone": null,
  "creditName": null,
  "creditNotes": null
}
```

**Alternative Request (M-Pesa):**
```json
{
  "productId": "p-2",
  "productName": "Sugar 2kg",
  "quantity": 5,
  "revenue": 1250,
  "profit": 350,
  "branchId": "b-1",
  "paymentMode": "mpesa",
  "paymentStatus": "settled",
  "mpesaPhone": "254712345678"
}
```

**Alternative Request (Credit):**
```json
{
  "productId": "p-4",
  "productName": "Maize Flour 2kg",
  "quantity": 8,
  "revenue": 1520,
  "profit": 480,
  "branchId": "b-1",
  "paymentMode": "credit",
  "paymentStatus": "credited",
  "creditName": "Ahmed's Supermarket",
  "creditNotes": "Payment due by 28-02-2026"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "s-new",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 2,
    "revenue": 1300,
    "profit": 400,
    "date": "2026-02-28T13:00:00Z",
    "branchId": "b-1",
    "paymentMode": "cash",
    "paymentStatus": "settled",
    "createdAt": "2026-02-28T13:00:00Z"
  }
}
```

**Note:** This endpoint should automatically:
- Generate transaction ID
- Calculate profit (quantity × (sellingPrice - costPrice))
- Calculate revenue (quantity × sellingPrice)
- Deduct from product quantity
- If credit, create a CreditSale record

---

#### 4. Update Sale
```
PUT /api/sales/:saleId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "quantity": 3,
  "revenue": 1950,
  "profit": 600
}
```

**Note:** Limited updates allowed (mainly for corrections). Payment mode/status changes may trigger credit sale updates.

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "s-1",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 3,
    "revenue": 1950,
    "profit": 600,
    "updatedAt": "2026-02-28T13:15:00Z"
  }
}
```

---

#### 5. Delete Sale
```
DELETE /api/sales/:saleId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Note:** When deleting, must:
- Restore product quantity
- Delete associated CreditSale record if exists

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Sale deleted successfully",
  "data": {
    "id": "s-1"
  }
}
```

---

### Credit Sales (Debtors) Management Module

#### 1. Get All Credit Sales
```
GET /api/credit-sales
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `isPaid` (optional) - Filter by payment status (true/false)
- `search` (optional) - Search by customer name
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "creditSales": [
      {
        "id": "cs-1",
        "saleId": "s-3",
        "creditName": "Ahmed's Supermarket",
        "amount": 1520,
        "dueDate": "2026-02-28",
        "notes": "Payment due by 28-02-2026",
        "branchId": "b-1",
        "createdDate": "2026-02-22T14:45:00Z",
        "isPaid": false,
        "paidDate": null,
        "daysOverdue": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

#### 2. Get Credit Sale by ID
```
GET /api/credit-sales/:creditSaleId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "cs-1",
    "saleId": "s-3",
    "creditName": "Ahmed's Supermarket",
    "amount": 1520,
    "dueDate": "2026-02-28",
    "notes": "Payment due by 28-02-2026",
    "branchId": "b-1",
    "createdDate": "2026-02-22T14:45:00Z",
    "isPaid": false,
    "paidDate": null,
    "daysOverdue": 0,
    "sale": {
      "id": "s-3",
      "productId": "p-4",
      "productName": "Maize Flour 2kg",
      "quantity": 8,
      "revenue": 1520,
      "profit": 480,
      "date": "2026-02-22T14:45:00Z"
    }
  }
}
```

---

#### 3. Create Credit Sale
```
POST /api/credit-sales
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "saleId": "s-3",
  "creditName": "Ahmed's Supermarket",
  "amount": 1520,
  "dueDate": "2026-02-28",
  "notes": "Payment due by 28-02-2026",
  "branchId": "b-1"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "cs-1",
    "saleId": "s-3",
    "creditName": "Ahmed's Supermarket",
    "amount": 1520,
    "dueDate": "2026-02-28",
    "notes": "Payment due by 28-02-2026",
    "branchId": "b-1",
    "createdDate": "2026-02-28T14:00:00Z",
    "isPaid": false,
    "paidDate": null
  }
}
```

---

#### 4. Mark Credit Sale as Paid
```
PUT /api/credit-sales/:creditSaleId/mark-paid
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "paidDate": "2026-02-28"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "cs-1",
    "creditName": "Ahmed's Supermarket",
    "amount": 1520,
    "isPaid": true,
    "paidDate": "2026-02-28T15:00:00Z"
  }
}
```

---

#### 5. Delete Credit Sale
```
DELETE /api/credit-sales/:creditSaleId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Credit sale deleted successfully",
  "data": {
    "id": "cs-1"
  }
}
```

---

### Expense Management Module

#### 1. Get All Expenses
```
GET /api/expenses
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `category` (optional) - Filter by expense category
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "e-1",
        "category": "Rent",
        "amount": 15000,
        "date": "2026-02-01",
        "notes": "February rent for main branch",
        "branchId": "b-1",
        "isRecurring": true,
        "recurringFrequency": "monthly",
        "recurringEndDate": null,
        "createdAt": "2026-02-01T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

#### 2. Get Expense by ID
```
GET /api/expenses/:expenseId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "e-1",
    "category": "Rent",
    "amount": 15000,
    "date": "2026-02-01",
    "notes": "February rent for main branch",
    "branchId": "b-1",
    "isRecurring": true,
    "recurringFrequency": "monthly",
    "recurringEndDate": null,
    "createdAt": "2026-02-01T09:00:00Z",
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

#### 3. Create Expense
```
POST /api/expenses
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request (One-time Expense):**
```json
{
  "category": "Supplies",
  "amount": 5000,
  "date": "2026-02-28",
  "notes": "Office supplies purchase",
  "branchId": "b-1",
  "isRecurring": false
}
```

**Request (Recurring Expense):**
```json
{
  "category": "Utilities",
  "amount": 2500,
  "date": "2026-02-01",
  "notes": "Monthly electricity bill",
  "branchId": "b-1",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "recurringEndDate": null
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "e-new",
    "category": "Supplies",
    "amount": 5000,
    "date": "2026-02-28",
    "notes": "Office supplies purchase",
    "branchId": "b-1",
    "isRecurring": false,
    "createdAt": "2026-02-28T14:00:00Z"
  }
}
```

---

#### 4. Update Expense
```
PUT /api/expenses/:expenseId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 5500,
  "notes": "Office supplies - Updated"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "e-1",
    "category": "Supplies",
    "amount": 5500,
    "date": "2026-02-28",
    "notes": "Office supplies - Updated",
    "branchId": "b-1",
    "updatedAt": "2026-02-28T14:15:00Z"
  }
}
```

---

#### 5. Delete Expense
```
DELETE /api/expenses/:expenseId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {
    "id": "e-1"
  }
}
```

---

### Expense Categories Module

#### 1. Get All Expense Categories
```
GET /api/expense-categories
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "id": "ec-1", "name": "Rent" },
      { "id": "ec-2", "name": "Utilities" },
      { "id": "ec-3", "name": "Transport" },
      { "id": "ec-4", "name": "Supplies" },
      { "id": "ec-5", "name": "Staff Salary" },
      { "id": "ec-6", "name": "Marketing" },
      { "id": "ec-7", "name": "Maintenance" },
      { "id": "ec-8", "name": "Insurance" },
      { "id": "ec-9", "name": "Other" }
    ]
  }
}
```

---

#### 2. Create Expense Category
```
POST /api/expense-categories
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Advertising"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "ec-10",
    "name": "Advertising"
  }
}
```

---

### Damaged Goods Management Module

#### 1. Get All Damaged Goods
```
GET /api/damaged-goods
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `productId` (optional) - Filter by product
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `reason` (optional) - Filter by damage reason
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "damagedGoods": [
      {
        "id": "dg-1",
        "productId": "p-1",
        "productName": "Rice 5kg",
        "quantity": 2,
        "reason": "Water damage",
        "date": "2026-02-25",
        "branchId": "b-1",
        "createdAt": "2026-02-25T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

#### 2. Get Damaged Good by ID
```
GET /api/damaged-goods/:damagedGoodId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "dg-1",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 2,
    "reason": "Water damage",
    "date": "2026-02-25",
    "branchId": "b-1",
    "createdAt": "2026-02-25T10:30:00Z",
    "updatedAt": "2026-02-25T10:30:00Z"
  }
}
```

---

#### 3. Create Damaged Good Record
```
POST /api/damaged-goods
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "productId": "p-1",
  "productName": "Rice 5kg",
  "quantity": 2,
  "reason": "Water damage during delivery",
  "date": "2026-02-25",
  "branchId": "b-1"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "dg-new",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 2,
    "reason": "Water damage during delivery",
    "date": "2026-02-25",
    "branchId": "b-1",
    "createdAt": "2026-02-25T11:00:00Z"
  }
}
```

**Note:** This endpoint should automatically deduct from product quantity.

---

#### 4. Update Damaged Good Record
```
PUT /api/damaged-goods/:damagedGoodId
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "quantity": 3,
  "reason": "Water damage - updated assessment"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "dg-1",
    "productId": "p-1",
    "productName": "Rice 5kg",
    "quantity": 3,
    "reason": "Water damage - updated assessment",
    "updatedAt": "2026-02-25T11:15:00Z"
  }
}
```

**Note:** Must adjust product quantity if quantity changes.

---

#### 5. Delete Damaged Good Record
```
DELETE /api/damaged-goods/:damagedGoodId
```

**Request Headers:**
```
Authorization: Bearer {token}
```

**Note:** Must restore product quantity when deleted.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Damaged good record deleted successfully",
  "data": {
    "id": "dg-1"
  }
}
```

---

### Restock Management Module

#### 1. Restock Product(s)
```
POST /api/restock
```

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request (Single Product):**
```json
{
  "restockItems": [
    {
      "productId": "p-2",
      "quantity": 25,
      "costPrice": 180,
      "notes": "Restocked from supplier"
    }
  ],
  "branchId": "b-1"
}
```

**Request (Multiple Products):**
```json
{
  "restockItems": [
    {
      "productId": "p-2",
      "quantity": 25,
      "costPrice": 180,
      "notes": "Restocked from supplier"
    },
    {
      "productId": "p-3",
      "quantity": 15,
      "costPrice": 220,
      "notes": "Restocked from supplier"
    }
  ],
  "branchId": "b-1"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "restockId": "rs-new",
    "items": [
      {
        "productId": "p-2",
        "productName": "Sugar 2kg",
        "previousQuantity": 12,
        "newQuantity": 37,
        "quantityAdded": 25,
        "costPrice": 180
      }
    ],
    "branchId": "b-1",
    "totalCost": 4500,
    "date": "2026-02-28T14:30:00Z"
  }
}
```

---

#### 2. Get Restock History
```
GET /api/restock
```

**Query Parameters:**
- `branchId` (optional) - Filter by branch
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `page` (optional) - Pagination page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "restocks": [
      {
        "restockId": "rs-1",
        "branchId": "b-1",
        "date": "2026-02-28T14:30:00Z",
        "items": [
          {
            "productId": "p-2",
            "productName": "Sugar 2kg",
            "previousQuantity": 12,
            "newQuantity": 37,
            "quantityAdded": 25,
            "costPrice": 180
          }
        ],
        "totalCost": 4500
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

---

### Reports & Analytics Module

#### 1. Get Dashboard KPIs
```
GET /api/reports/dashboard-kpis
```

**Query Parameters:**
- `branchId` (required) - Branch to get KPIs for
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalInventoryValue": 87500,
    "expectedProfit": 24300,
    "todayRevenue": 5350,
    "lowStockItems": 2,
    "lowStockProducts": [
      {
        "id": "p-5",
        "name": "Tea Leaves 500g",
        "quantity": 5,
        "reorderThreshold": 12
      },
      {
        "id": "p-6",
        "name": "Milk 500ml",
        "quantity": 8,
        "reorderThreshold": 30
      }
    ]
  }
}
```

---

#### 2. Get 7-Day Sales Report
```
GET /api/reports/sales-7days
```

**Query Parameters:**
- `branchId` (required) - Branch to get report for

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "revenues": [3250, 4120, 3890, 5100, 4850, 6200, 5350],
    "profits": [950, 1200, 1100, 1500, 1400, 1800, 1550],
    "totalRevenue": 33000,
    "totalProfit": 9600,
    "averageDailyRevenue": 4714.29,
    "averageDailyProfit": 1371.43
  }
}
```

---

#### 3. Get Payment Reconciliation Report
```
GET /api/reports/payment-reconciliation
```

**Query Parameters:**
- `branchId` (required) - Branch to get report for
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "settledCash": 15000,
      "settledMpesa": 12500,
      "totalSettled": 27500,
      "creditOutstanding": 3040,
      "creditPaid": 1520,
      "totalCredit": 4560
    },
    "byPaymentMode": {
      "cash": {
        "count": 8,
        "total": 15000,
        "average": 1875
      },
      "mpesa": {
        "count": 5,
        "total": 12500,
        "average": 2500
      },
      "credit": {
        "count": 2,
        "total": 4560,
        "average": 2280
      }
    },
    "creditSales": [
      {
        "id": "cs-1",
        "creditName": "Ahmed's Supermarket",
        "amount": 1520,
        "dueDate": "2026-02-28",
        "isPaid": false,
        "daysOverdue": 0
      }
    ]
  }
}
```

---

#### 4. Get Cash Register Balancing Report
```
GET /api/reports/cash-register
```

**Query Parameters:**
- `branchId` (required) - Branch to get report for
- `period` (required) - 'today', 'week', or 'month'

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "date": "2026-02-28",
    "cashReceived": 15000,
    "mpesaReceived": 12500,
    "creditOutstanding": 3040,
    "totalRevenue": 30540,
    "variance": 3040,
    "transactions": [
      {
        "id": "s-1",
        "type": "sale",
        "productName": "Rice 5kg",
        "amount": 1950,
        "paymentMode": "cash",
        "date": "2026-02-28T10:30:00Z"
      }
    ]
  }
}
```

---

#### 5. Get Expense Report
```
GET /api/reports/expenses
```

**Query Parameters:**
- `branchId` (required) - Branch to get report for
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `groupBy` (optional) - 'category' or 'date' (default: 'category')

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 32500,
    "byCategory": {
      "Rent": 15000,
      "Utilities": 2500,
      "Transport": 1200,
      "Supplies": 5000,
      "Staff Salary": 8800
    },
    "expenses": [
      {
        "id": "e-1",
        "category": "Rent",
        "amount": 15000,
        "date": "2026-02-01",
        "notes": "February rent",
        "isRecurring": true
      }
    ]
  }
}
```

---

#### 6. Get Inventory Report
```
GET /api/reports/inventory
```

**Query Parameters:**
- `branchId` (required) - Branch to get report for
- `sortBy` (optional) - 'quantity', 'value', or 'profit' (default: 'value')

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalInventoryValue": 87500,
    "totalExpectedProfit": 24300,
    "totalItems": 6,
    "lowStockCount": 2,
    "products": [
      {
        "id": "p-1",
        "name": "Rice 5kg",
        "quantity": 45,
        "costPrice": 450,
        "sellingPrice": 650,
        "profit": 200,
        "inventoryValue": 29250,
        "isLowStock": false
      }
    ]
  }
}
```

---

## Work Order & Implementation Sequence

### Phase 1: Foundation (Database & Authentication)
**Priority: CRITICAL**

1. ✅ **Database Setup**
   - Create all 8 tables with proper relationships
   - Add indexes on frequently queried columns (email, userId, branchId, date)
   - Set up foreign key constraints

2. ✅ **Authentication Endpoints**
   - `POST /api/auth/login` - User authentication
   - `POST /api/auth/logout` - Logout functionality
   - `POST /api/auth/refresh` - Token refresh
   - Implement JWT token generation & validation
   - Password hashing (bcrypt)

---

### Phase 2: Core Data Management (Users & Branches)
**Priority: HIGH**

3. ✅ **User Management**
   - `GET /api/users` - List all users with filters
   - `GET /api/users/:userId` - Get specific user
   - `POST /api/users` - Create new user
   - `PUT /api/users/:userId` - Update user
   - `DELETE /api/users/:userId` - Delete user

4. ✅ **Branch Management**
   - `GET /api/branches` - List all branches
   - `GET /api/branches/:branchId` - Get specific branch
   - `POST /api/branches` - Create new branch
   - `PUT /api/branches/:branchId` - Update branch
   - `DELETE /api/branches/:branchId` - Delete branch

---

### Phase 3: Product Management
**Priority: HIGH**

5. ✅ **Product CRUD Operations**
   - `GET /api/products` - List products with filters
   - `GET /api/products/:productId` - Get specific product
   - `POST /api/products` - Create product
   - `PUT /api/products/:productId` - Update product
   - `DELETE /api/products/:productId` - Delete product

6. ✅ **Restock Management**
   - `POST /api/restock` - Record restock (single/batch)
   - `GET /api/restock` - Get restock history

---

### Phase 4: Sales & Revenue Management
**Priority: CRITICAL**

7. ✅ **Sales Transactions**
   - `GET /api/sales` - List sales with filters
   - `GET /api/sales/:saleId` - Get specific sale
   - `POST /api/sales` - Record new sale (auto-deduct inventory)
   - `PUT /api/sales/:saleId` - Update sale
   - `DELETE /api/sales/:saleId` - Delete sale (restore inventory)

8. ✅ **Credit Sales (Debtors)**
   - `GET /api/credit-sales` - List credit sales
   - `GET /api/credit-sales/:creditSaleId` - Get specific credit
   - `POST /api/credit-sales` - Create credit sale record
   - `PUT /api/credit-sales/:creditSaleId/mark-paid` - Mark as paid
   - `DELETE /api/credit-sales/:creditSaleId` - Delete credit sale

---

### Phase 5: Damaged Goods Management
**Priority: MEDIUM**

9. ✅ **Damaged Goods Tracking**
   - `GET /api/damaged-goods` - List damaged goods
   - `GET /api/damaged-goods/:damagedGoodId` - Get specific record
   - `POST /api/damaged-goods` - Record damaged item (auto-deduct)
   - `PUT /api/damaged-goods/:damagedGoodId` - Update record
   - `DELETE /api/damaged-goods/:damagedGoodId` - Delete record (restore quantity)

---

### Phase 6: Expense Management
**Priority: HIGH**

10. ✅ **Expense Tracking**
    - `GET /api/expenses` - List expenses with filters
    - `GET /api/expenses/:expenseId` - Get specific expense
    - `POST /api/expenses` - Create expense (one-time or recurring)
    - `PUT /api/expenses/:expenseId` - Update expense
    - `DELETE /api/expenses/:expenseId` - Delete expense

11. ✅ **Expense Categories**
    - `GET /api/expense-categories` - List all categories
    - `POST /api/expense-categories` - Create custom category

---

### Phase 7: Reports & Analytics
**Priority: MEDIUM**

12. ✅ **Analytics & Reporting**
    - `GET /api/reports/dashboard-kpis` - KPI summary
    - `GET /api/reports/sales-7days` - 7-day sales trend
    - `GET /api/reports/payment-reconciliation` - Payment status report
    - `GET /api/reports/cash-register` - Cash balancing report
    - `GET /api/reports/expenses` - Expense summary
    - `GET /api/reports/inventory` - Inventory status report

---

## Additional Implementation Notes

### Security Requirements
- All endpoints (except `/api/auth/login`) require JWT authentication
- Admin-only endpoints: user management, branch management, expense categories
- Staff users can only manage data for their assigned branch
- Password hashing: bcrypt with salt rounds = 10

### Data Validation
- Email uniqueness check before creating users
- Date formats: ISO 8601 (YYYY-MM-DD for dates, ISO 8601 for timestamps)
- M-Pesa phone format: Must start with 254 followed by 9 digits
- Numeric fields: Validate positive values (prices, quantities)
- Required fields must be present in all requests

### Transaction Handling
- **Sale Creation**: Atomically create sale record AND deduct inventory
- **Sale Deletion**: Atomically delete sale AND restore inventory
- **Damaged Goods**: Atomically record damage AND deduct inventory
- **Restock**: Atomically record restock AND increase inventory

### Business Logic
- Profit calculation: Revenue - (Quantity × Cost Price)
- Inventory value: Sum of (Unit × Selling Price) for all products
- Expected profit: Sum of (Quantity × (Selling Price - Cost Price))
- Days overdue: Current date - Due date for unpaid credits
- Recurring expenses: Auto-create entries based on frequency and end date

### Response Format (Standard)
All responses follow this structure:
```json
{
  "success": boolean,
  "data": {} OR null,
  "error": "string OR null",
  "code": "ERROR_CODE OR null",
  "timestamp": "ISO 8601 timestamp"
}
```

### Error Codes
- `INVALID_CREDENTIALS` - Login failed
- `EMAIL_EXISTS` - Email already registered
- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `INSUFFICIENT_STOCK` - Not enough inventory
- `UNAUTHORIZED` - Missing auth token
- `FORBIDDEN` - User lacks permission
- `VALIDATION_ERROR` - Invalid input
- `INTERNAL_ERROR` - Server error

---

## Database Relationships Diagram

```
users → branches (FK: branchId)
products → branches (FK: branchId)
sales → products (FK: productId)
sales → branches (FK: branchId)
creditSales → sales (FK: saleId)
creditSales → branches (FK: branchId)
expenses → branches (FK: branchId)
expenses → expenseCategories (FK: category)
damagedGoods → products (FK: productId)
damagedGoods → branches (FK: branchId)
```

