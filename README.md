# Big Bull Trading Platform - Windows Installation Guide

This guide provides detailed instructions for installing and running the Big Bull trading platform on a Windows machine.

## Project Overview

Big Bull is a full-stack trading platform built with React, FastAPI, and SQLite, featuring a modern interface with real-time market data visualization, portfolio management, and trading capabilities.

## Features

- User authentication (register, login, logout)
- Modern landing page with hero section and testimonials
- Dashboard with market overview and charts
- Portfolio management with visualization
- Stock browsing and detailed stock information
- Buy and sell functionality
- Transaction history
- Fund management
- Interactive charts for performance visualization

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Headless UI for accessible components
- Axios for API requests
- Chart.js for data visualization

### Backend
- FastAPI for high-performance API
- SQLAlchemy ORM
- SQLite database
- JWT for authentication
- Pydantic for data validation

## Prerequisites for Windows

1. **Python 3.8+**
   - Download from [python.org](https://www.python.org/downloads/windows/)
   - Ensure "Add Python to PATH" is checked during installation

2. **Node.js 14+**
   - Download from [nodejs.org](https://nodejs.org/en/download/)

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/download/win)

4. **Visual Studio Code** (recommended, but optional)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/download)

## Installation Steps

### 1. Clone the Repository

Open Command Prompt or PowerShell and run:

```bash
git clone https://github.com/yourusername/big-bull.git
cd big-bull
```

### 2. Set Up the Backend

#### Create and Activate a Virtual Environment

```bash
# Navigate to the project directory
cd big-bull

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate
```

#### Install Backend Dependencies

```bash
# Make sure you're in the project root directory
pip install -r backend/requirements.txt
```

### 3. Set Up the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

## Running the Application

### 1. Start the Backend Server

Open a Command Prompt window, navigate to the project directory, and run:

```bash
# Activate the virtual environment if not already activated
venv\Scripts\activate

# Start the server (from the project root)
python -m uvicorn backend.app.main:app --reload
```

The backend server will start running at `http://localhost:8000`.

### 2. Start the Frontend Development Server

Open another Command Prompt window, navigate to the project directory, and run:

```bash
# Navigate to the frontend directory
cd frontend

# Start the development server
npm run dev
```

The frontend development server will start and display a URL (typically `http://localhost:5173` or similar) in the terminal.

## Accessing the Application

1. Open your browser and navigate to the URL displayed in the frontend terminal (typically `http://localhost:5173`)
2. You can now use the application!

## API Documentation

The API documentation is automatically generated and available at `http://localhost:8000/docs` when the backend server is running.

## Troubleshooting Common Windows Issues

### Port Already in Use

If you see an error like "Address already in use" when starting the server:

```bash
# For backend, use a different port
python -m uvicorn backend.app.main:app --reload --port 8001

# For frontend, Vite will automatically try another port, or you can specify
npm run dev -- --port 5174
```

### Python Command Not Found

If Windows doesn't recognize the `python` command, try using `py` instead:

```bash
py -m venv venv
py -m pip install -r backend/requirements.txt
py -m uvicorn backend.app.main:app --reload
```

### Module Not Found Errors

If you get "Module not found" errors after installing dependencies:

```bash
# Make sure you're in the project root with the virtual environment activated
venv\Scripts\activate
pip install -r backend/requirements.txt

# If still having issues, try installing each package individually
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib bcrypt python-multipart pydantic-settings
```

### SQLite Issues

If you encounter SQLite-related errors:

```bash
# Ensure the database directory exists
mkdir -p backend\database
```

## Using the Demo Account

For testing purposes, you can use the following demo account:

- **Email**: demo@example.com
- **Password**: password123

## Database

The application uses SQLite for simplicity. The database file will be created at `bigbull.db` when you run the backend server for the first time.

## Modifying the Database Name (Optional)

If you need to change the database name from the default:

1. Open `backend/database/database.py`
2. Change the `SQLALCHEMY_DATABASE_URL` value from `"sqlite:///./zerodha.db"` to `"sqlite:///./bigbull.db"`

## License

This project is licensed under the MIT License. 