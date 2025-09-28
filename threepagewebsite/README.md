
# UIverse

Your personalised AI guide to the UI/UX universe

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:5000

### Frontend Setup
1. In the root directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will run on http://localhost:5173

### Testing the Connection
You can test if the backend is working by running:
```bash
node test-backend.js
```

## Troubleshooting

If the image upload isn't working:
1. Make sure both frontend and backend servers are running
2. Check that the backend is accessible at http://localhost:5000
3. Verify the Google API key is set correctly in backend/.env
4. Check the browser console and backend logs for error messages
  