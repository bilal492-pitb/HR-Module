import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  EventAvailable as EventIcon,
  Apartment as DepartmentIcon,
  School as SchoolIcon,
  EventNote as LeaveIcon,
  Laptop as AssetIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { currentUser, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        
        if (hasRole('manager')) {
          const response = await axios.get('/employees/statistics');
          setStats(response.data.data);
        } else {
          // For regular employees, just get their own data
          // This would be expanded in a real app
          setStats({
            totalEmployees: 1,
            employeesByDepartment: [],
            employeesByStatus: [],
            recentJoiners: 0
          });
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [hasRole]);

  // Generate chart data from stats
  const generateDepartmentChartData = () => {
    if (!stats || !stats.employeesByDepartment || stats.employeesByDepartment.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Employees by Department',
            data: [0],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      };
    }

    return {
      labels: stats.employeesByDepartment.map(item => item.department || 'Not Assigned'),
      datasets: [
        {
          label: 'Employees by Department',
          data: stats.employeesByDepartment.map(item => item.count),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Employee Distribution by Department',
      },
    },
  };

  // Quick access cards based on user role
  const getQuickAccessCards = () => {
    const cards = [];

    // Cards for all users
    cards.push(
      <Grid item xs={12} sm={6} md={4} key="profile">
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h6">My Profile</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              View and update your personal information and settings
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );

    // Manager and above
    if (hasRole('manager')) {
      cards.push(
        <Grid item xs={12} sm={6} md={4} key="employees">
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Employees</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and manage all employee records
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/employees')}>
                View Employees
              </Button>
              {hasRole('hr') && (
                <Button size="small" onClick={() => navigate('/employees/create')}>
                  Add New
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      );
      
      cards.push(
        <Grid item xs={12} sm={6} md={4} key="leaves">
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LeaveIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Leave Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and manage employee leave requests
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/leaves')}>
                View Leaves
              </Button>
            </CardActions>
          </Card>
        </Grid>
      );
    }

    // HR specific
    if (hasRole('hr')) {
      cards.push(
        <Grid item xs={12} sm={6} md={4} key="qualifications">
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Qualifications</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage employee qualifications and certifications
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/qualifications')}>
                View Qualifications
              </Button>
            </CardActions>
          </Card>
        </Grid>
      );
      
      cards.push(
        <Grid item xs={12} sm={6} md={4} key="assets">
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssetIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Asset Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Track company assets assigned to employees
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/assets')}>
                View Assets
              </Button>
            </CardActions>
          </Card>
        </Grid>
      );
    }

    return cards;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Welcome back, {currentUser?.username}!
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          {/* Stats Cards - Only for managers and above */}
          {hasRole('manager') && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4">{stats.totalEmployees}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Employees</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <PersonAddIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4">{stats.recentJoiners}</Typography>
                  <Typography variant="body2" color="textSecondary">New Joiners (30 days)</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <DepartmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4">
                    {stats.employeesByDepartment?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Departments</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4">--</Typography>
                  <Typography variant="body2" color="textSecondary">Upcoming Events</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Chart - Only for managers and above */}
          {hasRole('manager') && stats.employeesByDepartment?.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Bar data={generateDepartmentChartData()} options={chartOptions} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Employment Status
                  </Typography>
                  <List>
                    {stats.employeesByStatus && stats.employeesByStatus.length > 0 ? (
                      stats.employeesByStatus.map((status) => (
                        <ListItem key={status.employmentStatus || 'Not Set'}>
                          <ListItemIcon>
                            <BusinessIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={status.employmentStatus || 'Not Set'} 
                            secondary={`${status.count} employee(s)`} 
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No data available" />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Quick Access Cards */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Quick Access
            </Typography>
            <Grid container spacing={3}>
              {getQuickAccessCards()}
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 