# Bakery Ordering System API

Welcome to the Bakery Ordering System API. This is a backend service built with Node.js and TypeScript, providing RESTful API endpoints for handling bakery orders, products, and user authentication.

## Requirements

Before you begin, ensure you have the following installed:
- Node.js (version 18.19.1 or above)
- Docker (for containerization)
- PostgreSQL (for the database)

---
## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/WebDevelopment-ASU/Bakery-System-Backend.git
cd bakery-system-backend
```


2. **Install dependencies:**

```bash
npm install
```


3. **Set up environment variables:**

Create a `.env` file in the project root and fill it with the necessary values:

```
DATABASE_URL=postgresql://username:password@localhost:5432/bakery_db
JWT_SECRET=your_jwt_secret
```


4. **Database setup:**

Run the following command to create your database tables using Prisma:

```bash
npx prisma migrate deploy
```


5. **Build the project:**

```bash
npm run build
```


---

## Docker Setup

To run the project using Docker, follow these steps:

1. **Build the Docker image:**

```bash
docker compose -f local.yml build
```


2. **Run the Docker container:**

```bash
docker compose -f local.yml up
```

The service will be available on `http://localhost:3001`.

---
## Usage

To start the application in development mode, use:

```bash
npm run dev
```

For production environments, ensure that `NODE_ENV` is set to `production` in your `.env` file.

---
## API Documentation

Access the Swagger UI for API documentation and testing at `http://localhost:3001/api-docs` after starting the application.

---
## Testing

- Run the following command to execute tests:

```bash
npm run test
```

---

- Here are some data sample for manual testing the APIs

1. User SignUp & SignIn

```json
// STAFF REGISTERATION
{
  "username": "staff",
  "email": "staff@staff.com",
  "password": "staff123",
  "role": "STAFF"
}

// CUSTOMER REGISTRATION
{
  "username": "customer",
  "email": "customer@gmail.com",
  "password": "customer123",
  "role": "CUSTOMER"
}

// STAFF LOGIN
{
  "username": "staff",
  "password": "staff123"
}

// CUSTOMER LOGIN
{
  "username": "customer",
  "password": "customer123"
}
```

---

2. Product CRUD

```json
{
  "name": "Product",
  "description": "The product description",
  "price": 100,
  "stock": 10
}
```


---

3. Orders CRUD

```json
{
  "orderItems": [
    { "productId": "uuid-of-product-1", "quantity": 2 },
    { "productId": "uuid-of-product-2", "quantity": 1 }
  ]
}

```


---
## Linting and Formatting

- To Lint the project files, run:

```bash
npm run lint
```


- To automatically fix Linting errors, run:

```bash
npm run fix
```

---
## Contributing

Contributions are welcome! Please follow the established patterns and add unit tests for new features.
