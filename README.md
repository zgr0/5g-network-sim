# 5G Network Simulator

## Overview

This project simulates a 5G network environment, providing tools to build, visualize, and analyze network topologies and device metrics. It consists of a Node.js/Express backend and a React-based frontend.

## Features
- Build and visualize custom network topologies
- Configure devices and network parameters
- Real-time metrics dashboard
- Interactive simulation controls

## Project Structure
```
5g-network-sim/
  backend/      # Node.js/Express backend
    models/     # Data models (e.g., Topology.js)
    server.js   # Main server entry point
  frontend/     # React frontend
    src/        # React source code and components
```

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd 5g-network-sim
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Start the Backend Server
```bash
cd backend
npm start
```

#### Start the Frontend (React App)
```bash
cd frontend
npm start
```

The frontend will typically run on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:5000](http://localhost:5000) (or as configured).

## Main Dependencies

### Backend
- express
- cors

### Frontend
- react
- react-dom
- react-scripts
- axios
- d3
- react-chartjs-2
