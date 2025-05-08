import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// API Connection Check
import ApiConnectionCheck from './components/common/ApiConnectionCheck';

// Employee pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import EmployeeCreate from './pages/employees/EmployeeCreate';
import EmployeeEdit from './pages/employees/EmployeeEdit';

// Role Management
import { Posts, Roles, Permissions, RoleLog } from './pages/roleManagement';

// Import the real Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Migration utilities
import { checkForMigrationNeeded, migrateLocalStorageToDatabase } from './utils/migrationUtils';
import apiConfig from './config/api';

// Placeholder components for future features
const QualificationList = () => <div>Qualifications Page</div>;
const DependentList = () => <div>Dependents Page</div>;
const TrainingList = () => <div>Trainings Page</div>;
const MedicalRecordList = () => <div>Medical Records Page</div>;
const SalaryHistoryList = () => <div>Salary History Page</div>;
const BankDetailsList = () => <div>Bank Details Page</div>;
const LeaveList = () => <div>Leave Page</div>;
const AssetList = () => <div>Assets Page</div>;

// Create theme with new color scheme based on the PAFDA design
const theme = createTheme({
  palette: {
    primary: {
      main: '#005F2F', // Dark green for header from PAFDA design
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A9DEF9', // Light blue for tabs from PAFDA design
      contrastText: '#000000',
    },
    success: {
      main: '#C1F179', // Light green for save buttons
      contrastText: '#000000',
    },
    info: {
      main: '#A9DEF9', // Light blue for secondary buttons
      contrastText: '#000000',
    },
    warning: {
      main: '#F7A41D', // Orange/amber for action buttons
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    action: {
      active: '#005F2F',
      hover: 'rgba(0, 95, 47, 0.08)',
      selected: '#BFEA7C', // Light green for active tabs
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      color: '#005F2F', // Green headers
      fontWeight: 500,
    },
    h5: {
      color: '#005F2F', // Green headers
      fontWeight: 500,
    },
    h6: {
      color: '#333333', // Dark gray headers
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
        containedPrimary: {
          backgroundColor: '#F7A41D', // Orange/amber action buttons
          color: '#000000',
          '&:hover': {
            backgroundColor: '#E09218', // Slightly darker orange on hover
          },
        },
        containedSuccess: {
          backgroundColor: '#C1F179', // Light green save buttons
          color: '#000000',
          '&:hover': {
            backgroundColor: '#B1E169', // Slightly darker green on hover
          },
        },
        containedInfo: {
          backgroundColor: '#A9DEF9', // Light blue back buttons
          color: '#000000',
          '&:hover': {
            backgroundColor: '#98CEE9', // Slightly darker blue on hover
          },
        },
        outlinedPrimary: {
          borderColor: '#005F2F',
          color: '#005F2F',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#005F2F', // Dark green AppBar
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#E9F7FB', // Very light blue background for tabs
          borderRadius: '4px 4px 0 0',
        },
        indicator: {
          backgroundColor: '#BFEA7C', // Light green indicator
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#333333',
          '&.Mui-selected': {
            backgroundColor: '#BFEA7C', // Light green for active tab
            color: '#000000',
            fontWeight: 'bold',
          },
          borderRadius: '4px 4px 0 0',
          margin: '0 2px',
          minHeight: '48px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
        },
        columnHeaders: {
          backgroundColor: '#E9F7FB', // Very light blue header
          color: '#005F2F', // Dark green text
          fontWeight: 'bold',
        },
        row: {
          '&:hover': {
            backgroundColor: 'rgba(191, 234, 124, 0.1)', // Very light green hover
          },
        },
        cell: {
          borderColor: '#E0E0E0',
        },
        footerContainer: {
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F9F9F9',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#005F2F', // Dark green focus
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#005F2F', // Dark green focus
          },
        },
      },
    },
  },
});

function App() {
  // Automatic migration effect
  useEffect(() => {
    const migrateIfNeeded = async () => {
      // Only attempt migration if we're not in demo mode
      if (!apiConfig.isDemoMode()) {
        const { needed, count } = checkForMigrationNeeded();
        if (needed && count > 0) {
          try {
            await migrateLocalStorageToDatabase();
            console.info('Data migrated to backend successfully');
          } catch (err) {
            console.error('Migration failed:', err);
          }
        }
      }
    };
    migrateIfNeeded();
  }, []);

  // Check if we should use demo mode and set it upfront
  useEffect(() => {
    const isDemoEnvironment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('demo') ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('netlify.app') ||
      window.location.search.includes('demo=true');
    
    // Check if there's a token from a demo user
    const token = localStorage.getItem('token');
    const demoRequested = localStorage.getItem('requestDemo') === 'true';
    
    if (token && token.startsWith('demo_token_')) {
      apiConfig.setApiMode('demo');
      console.info('Demo mode activated - using demo user token');
    } else if (demoRequested || isDemoEnvironment) {
      apiConfig.setApiMode('demo');
      console.info('Demo mode activated - using demo environment detection');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiConnectionCheck />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Employee routes */}
              <Route path="employees">
                <Route index element={<EmployeeList />} />
                <Route path="create" element={
                  <ProtectedRoute requiredRole="hr">
                    <EmployeeCreate />
                  </ProtectedRoute>
                } />
                <Route path=":id" element={<EmployeeDetails />} />
                <Route path=":id/edit" element={
                  <ProtectedRoute requiredRole="hr">
                    <EmployeeEdit />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Module routes */}
              <Route path="qualifications" element={<QualificationList />} />
              <Route path="dependents" element={<DependentList />} />
              <Route path="trainings" element={<TrainingList />} />
              <Route path="medical-records" element={<MedicalRecordList />} />
              <Route path="salary-history" element={<SalaryHistoryList />} />
              <Route path="bank-details" element={<BankDetailsList />} />
              <Route path="leaves" element={<LeaveList />} />
              <Route path="assets" element={<AssetList />} />
              <Route path="role-management/posts" element={
                <ProtectedRoute requiredRole="hr">
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="role-management/roles" element={
                <ProtectedRoute requiredRole="hr">
                  <Roles />
                </ProtectedRoute>
              } />
              <Route path="role-management/permissions" element={
                <ProtectedRoute requiredRole="hr">
                  <Permissions />
                </ProtectedRoute>
              } />
              <Route path="role-management/role-log" element={
                <ProtectedRoute requiredRole="hr">
                  <RoleLog />
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 