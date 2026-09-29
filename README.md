# 📦 TraceFlow Logistics Center

TraceFlow is a modern supply chain and inventory management dashboard built with an **ASP.NET Core Web API** backend and a **React + Vite** single-page application frontend. It enables real-time tracking of warehouse inventory and fulfillment workflows.
This was made for acadmeic purposes.
---

## 🚀 Tech Stack

* **Backend:** C# / .NET (ASP.NET Core Web API, Entity Framework Core)
* **Frontend:** React 18, Vite, Tailwind CSS
* **Database:** SQL Server / In-Memory Database (EF Core)
* **Tooling:** ESLint, npm, Vite Proxy

---

## 🛠️ Project Architecture

```
CSharp/
├── Controllers/            # ASP.NET Core API Endpoints
│   ├── InventoryController.cs
│   └── ShipmentsController.cs
├── Models/                 # Data Models & DTOs
├── Program.cs              # API Server Entry Point
└── frontend/               # React + Vite Frontend
    ├── public/
    ├── src/
    │   ├── App.jsx         # Main Dashboard Component
    │   ├── main.jsx        # React DOM Root
    │   └── index.css       # Global Styles & Tailwind Config
    ├── index.html          # Shell HTML
    ├── package.json
    └── vite.config.js      # Vite Configuration & Proxy Rules

```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:

* [.NET 8.0 SDK](https://dotnet.microsoft.com/download) (or later)
* [Node.js](https://nodejs.org/) (v18.0 or later) & `npm`

---

### 1. Running the ASP.NET Core Backend

1. Open your terminal in the project root directory:
```bash
cd CSharp

```


2. Restore .NET dependencies and run the server:
```bash
dotnet restore
dotnet run

```


3. The Web API will start running (typically on `http://localhost:5000` or `https://localhost:7123`).

---

### 2. Running the React Frontend

1. Open a second terminal window and navigate to the `frontend` folder:
```bash
cd frontend

```


2. Install the Node package dependencies:
```bash
npm install

```


3. Start the Vite local development server:
```bash
npm run dev

```


4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---

## 📡 API Proxy Configuration

The React frontend uses Vite's built-in development proxy to route `/api` calls directly to your .NET server, avoiding CORS issues during local development.

Ensure your `frontend/vite.config.js` matches your backend port:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Matches your ASP.NET API URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
});

```

---

## 📋 API Endpoints Summary

### Inventory / Stock (`/api/inventory`)

* **`GET /api/inventory`** – Retrieve all warehouse items
* **`POST /api/inventory`** – Add a new inventory item
* **`PUT /api/inventory/{id}`** – Update existing product details
* **`DELETE /api/inventory/{id}`** – Remove a product from stock

### Shipments (`/api/shipments`)

* **`GET /api/shipments`** – Fetch active shipment trackers
* **`POST /api/shipments`** – Fulfill an order and generate a shipment tracking ID
* **`PATCH /api/shipments/{id}/status`** – Update shipment lifecycle status (e.g., Set to *In-Transit*)

---

## 🧪 Sample Test Data

To seed your database or test API endpoints manually via PowerShell or Postman:

#### Sample Inventory Item

```json
{
  "sku": "SKU-1001",
  "name": "Industrial Servo Motor 500W",
  "unitPrice": 249.99,
  "availableQuantity": 45
}

```

#### Sample Shipment Status Code Mapping

* **`0`**: Created
* **`1`**: Pending
* **`2`**: Processing
* **`3`**: In-Transit
* **`4`**: Delivered
* **`5`**: Cancelled