import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define logo styles for consistent size
// const logoStyle = {
//   height: '40px',
//   width: 'auto',
//   marginRight: '15px',
//   objectFit: 'contain'
// };

const Header = ({ toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={`${process.env.PUBLIC_URL}/PAFDA.JPG`}
            alt="Organization Logo" 
            style={logoStyle}
          />
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            HR Management System
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {currentUser && (
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 