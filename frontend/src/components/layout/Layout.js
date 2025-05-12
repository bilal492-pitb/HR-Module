import React, { useState, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import ApiModeToggle from '../common/ApiModeToggle';

const drawerWidth = 240;

const logoStyle = {
  height: '40px',
  width: 'auto',
  marginRight: '15px',
  objectFit: 'contain'
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [employeesOpen, setEmployeesOpen] = useState(true);
  const [roleManagementOpen, setRoleManagementOpen] = useState(true);
  const [rosterManagementOpen, setRosterManagementOpen] = useState(true);
  const { currentUser, logout, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const toggleEmployeesDropdown = () => {
    setEmployeesOpen(!employeesOpen);
  };

  const toggleRoleManagementDropdown = () => {
    setRoleManagementOpen(!roleManagementOpen);
  };

  const toggleRosterManagementDropdown = () => {
    setRosterManagementOpen(!rosterManagementOpen);
  };

  // Dashboard item
  const dashboardItem = {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    requiredRole: 'employee' // All roles can access
  };

  // Employee management items - simplified to only include All Employees
  const employeeItems = [
    {
      text: 'All Employees',
      icon: <PeopleIcon />,
      path: '/employees',
      requiredRole: 'manager'
    },
    {
      text: 'Add Employee',
      icon: <PersonAdd />,
      path: '/employees/create',
      requiredRole: 'hr'
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={`${process.env.PUBLIC_URL}/PAFDA.JPG`}
              alt="Organization Logo" 
              style={logoStyle}
            />
                 <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            HR Management System
          </Typography>
        </Box>
          </div>
        
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <ApiModeToggle />
          </Box>
          
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="large"
              edge="end"
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                Signed in as <strong>{currentUser?.username}</strong>
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List>
          {/* Dashboard Item */}
          {hasRole(dashboardItem.requiredRole) && (
            <ListItem key={dashboardItem.text} disablePadding>
              <ListItemButton onClick={() => navigate(dashboardItem.path)}>
                <ListItemIcon>
                  {dashboardItem.icon}
                </ListItemIcon>
                <ListItemText primary={dashboardItem.text} />
              </ListItemButton>
            </ListItem>
          )}

          {/* Employees Main Menu */}
          <ListItem disablePadding>
            <ListItemButton onClick={toggleEmployeesDropdown}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Employees" />
              {employeesOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={employeesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {employeeItems.map((item) => (
                hasRole(item.requiredRole) && (
                  <ListItemButton
                    key={item.text}
                    sx={{ pl: 4 }}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                )
              ))}
            </List>
          </Collapse>

          {/* Role Management Main Menu */}
          <ListItem disablePadding>
            <ListItemButton onClick={toggleRoleManagementDropdown}>
              <ListItemIcon>
                <span role="img" aria-label="role">🛡️</span>
              </ListItemIcon>
              <ListItemText primary="Role Management" />
              {roleManagementOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={roleManagementOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/role-management/posts')}>
                <ListItemText primary="Posts" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/role-management/roles')}>
                <ListItemText primary="Roles" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/role-management/permissions')}>
                <ListItemText primary="Permissions" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/role-management/role-log')}>
                <ListItemText primary="Role Log" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Roster Management Main Menu */}
          <ListItem disablePadding>
            <ListItemButton onClick={toggleRosterManagementDropdown}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Roster Management" />
              {rosterManagementOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={rosterManagementOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/roaster/duty-roaster')}>
                <ListItemText primary="Duty Roster" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/roaster/create')}>
                <ListItemText primary="Create Roster" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default Layout; 