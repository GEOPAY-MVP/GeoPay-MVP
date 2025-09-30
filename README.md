# GeoPay API Documentation

This folder contains the OpenAPI 3.0 specification for the **GeoPay MVP Backend**.

## 📂 Structure

## 🚀 How to Use

### Option 1: Open Locally
1. Open `index.html` in any modern browser.  
2. Swagger UI will render the documentation from `openapi.yaml`.  

### Option 2: Import into Tools
- **Postman** → Import `openapi.yaml` to auto-generate collections.  
- **SwaggerHub** → Import `openapi.yaml` for hosted documentation.  
- **Redoc** → Use `index.html` with Redoc for a cleaner look.  

## 🔑 Security
- All private endpoints require **JWT authentication** via `Authorization: Bearer <token>`.  

## 📌 Notes
- Base URL: `/api/v1`  
- Data format: `application/json`  
- Error handling: Standard HTTP codes with `{ "error": "message" }` responses.  
