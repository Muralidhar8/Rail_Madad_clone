# Rail Madad Clone

A MERN stack/Node.js-based web application.

## Prerequisites
Before you begin, ensure you have met the following requirements:
* You have installed **Node.js** (v14 or higher)
* You have installed **MySQL Server**
* You have a basic understanding of using the terminal/command prompt

## Setup & Installation

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or terminal).
2. Create a new database named `rail_madad` by running the following SQL query:
   ```sql
   CREATE DATABASE rail_madad;
   ```
3. Make sure your MySQL credentials in `server/config/db.js` match your local MySQL configuration (Default: user is `root` and password is `""`).

### 2. Backend (Server) Setup
1. Open a new terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on port 5000.*

### 3. Frontend (Client) Setup
1. Open another new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client should now be running and accessible typically at http://localhost:5173.*

## Usage
Once both the React frontend and Node.js backend are running, you can open your browser and navigate to the frontend URL to use the application. The system will automatically connect to your local MySQL database.
