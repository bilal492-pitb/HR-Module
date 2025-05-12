import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import { getStoredEmployees } from '../../utils/storageUtils';
import SearchIcon from '@mui/icons-material/Search';

const getRosterData = () => {
  try {
    const data = localStorage.getItem('dutyRosters');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveRosterData = (data) => {
  localStorage.setItem('dutyRosters', JSON.stringify(data));
};

const getMonthDays = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const shiftOptions = ['Morning', 'Evening', 'Night', 'Day Off'];

const CreateRoaster = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { employeeId: editEmployeeId, month: editMonth, year: editYear, editMode } = location.state || {};

  const [allEmployees, setAllEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(editMode && editMonth !== undefined ? editMonth : new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(editMode && editYear !== undefined ? editYear : new Date().getFullYear());
  const [shifts, setShifts] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const isEditMode = !!editMode;

  useEffect(() => {
    const storedEmployees = getStoredEmployees();
    setAllEmployees(storedEmployees);

    if (isEditMode && editEmployeeId) {
      const empToEdit = storedEmployees.find(e => e.id.toString() === editEmployeeId.toString());
      setDisplayedEmployees(empToEdit ? [empToEdit] : []);
    } else {
      setDisplayedEmployees(storedEmployees);
    }
  }, [isEditMode, editEmployeeId]);

  useEffect(() => {
    const days = getMonthDays(selectedYear, selectedMonth);
    const initialShifts = {};
    const targetEmployees = isEditMode && editEmployeeId ? displayedEmployees : allEmployees;
    const currentRosters = getRosterData();

    targetEmployees.forEach(emp => {
      initialShifts[emp.id] = {};
      const existingRoster = currentRosters.find(r => 
        r.employeeId.toString() === emp.id.toString() && 
        r.year === selectedYear && 
        r.month === selectedMonth
      );
      for (let d = 1; d <= days; d++) {
        initialShifts[emp.id][d] = existingRoster?.shifts?.[d] || [];
      }
    });
    setShifts(initialShifts);
  }, [selectedMonth, selectedYear, displayedEmployees, allEmployees, isEditMode, editEmployeeId]);
  
  const daysInMonth = getMonthDays(selectedYear, selectedMonth);

  const handleCheckboxChange = (empId, day, shift) => {
    setShifts(prev => {
      const currentShiftsForDay = prev[empId]?.[day] || [];
      let newShiftsForDay;
      if (currentShiftsForDay.includes(shift)) {
        newShiftsForDay = currentShiftsForDay.filter(s => s !== shift);
      } else {
        newShiftsForDay = [...currentShiftsForDay, shift];
      }
      return {
        ...prev,
        [empId]: {
          ...prev[empId],
          [day]: newShiftsForDay
        }
      };
    });
  };

  const handleSave = (empId) => {
    const prevRosters = getRosterData();
    const newRoster = {
      employeeId: empId,
      year: selectedYear,
      month: selectedMonth,
      shifts: shifts[empId]
    };
    const filteredRosters = prevRosters.filter(r => 
      !(r.employeeId.toString() === empId.toString() && r.year === selectedYear && r.month === selectedMonth)
    );
    const updatedRosters = [...filteredRosters, newRoster];
    saveRosterData(updatedRosters);
    setSnackbar({ open: true, message: isEditMode ? 'Roster updated successfully!' : 'Roster created successfully!', severity: 'success' });
    if(isEditMode) {
        setTimeout(() => navigate('/roaster/duty-roaster'), 1200);
    }
  };

  const handleClear = (empId) => {
    setShifts(prev => {
      const clearedDayShifts = {};
      const days = getMonthDays(selectedYear, selectedMonth);
      for (let d = 1; d <= days; d++) {
        clearedDayShifts[d] = [];
      }
      return {
        ...prev,
        [empId]: clearedDayShifts
      };
    });
  };

  const handleSearchChange = (event) => {
    const currentSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(currentSearchTerm);
    if (!isEditMode) {
        setDisplayedEmployees(
            allEmployees.filter(emp => 
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(currentSearchTerm) ||
            (emp.employeeId && emp.employeeId.toLowerCase().includes(currentSearchTerm))
          )
        );
    }
  };

  const pageTitle = isEditMode && displayedEmployees.length > 0 ? 
    `Edit Roaster for ${displayedEmployees[0].firstName} ${displayedEmployees[0].lastName}` : 
    'Create Roaster';

  return (
    <Box p={2}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar + 3, bgcolor: theme.palette.background.default, p: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>{pageTitle}</Typography>
        <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2} mb={2}>
          <FormControl size="small">
            <InputLabel>Month</InputLabel>
            <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(Number(e.target.value))} disabled={isEditMode}>
              {[...Array(12).keys()].map((m) => (
                <MenuItem key={m} value={m}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(Number(e.target.value))} disabled={isEditMode}>
              {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {!isEditMode && (
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search Employees..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
              sx={{ width: '300px' }}
            />
          )}
        </Box>
      </Box>
      <Paper sx={{ mb: 2, overflowX: 'auto', width: '100%' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: theme.zIndex.appBar + 2, backgroundColor: theme.palette.background.paper , minWidth: '150px'}}>Name</TableCell>
              <TableCell sx={{ position: 'sticky', left: '150px', zIndex: theme.zIndex.appBar + 2, backgroundColor: theme.palette.background.paper, minWidth: '120px' }}>Department</TableCell>
              <TableCell sx={{ position: 'sticky', left: '270px', zIndex: theme.zIndex.appBar + 2, backgroundColor: theme.palette.background.paper, minWidth: '120px' }}>Designation</TableCell>
              {[...Array(daysInMonth).keys()].map(d => (
                <TableCell key={d} align="center" sx={{minWidth: '150px'}}>{d + 1}</TableCell>
              ))}
              <TableCell sx={{ position: 'sticky', right: 0, zIndex: theme.zIndex.appBar + 2, backgroundColor: theme.palette.background.paper, minWidth: '200px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedEmployees.map(emp => (
              <TableRow key={emp.id}>
                <TableCell sx={{ position: 'sticky', left: 0, zIndex: theme.zIndex.appBar + 1, backgroundColor: theme.palette.background.paper }}>{emp.firstName} {emp.lastName}</TableCell>
                <TableCell sx={{ position: 'sticky', left: '150px', zIndex: theme.zIndex.appBar + 1, backgroundColor: theme.palette.background.paper }}>{emp.department}</TableCell>
                <TableCell sx={{ position: 'sticky', left: '270px', zIndex: theme.zIndex.appBar + 1, backgroundColor: theme.palette.background.paper }}>{emp.jobTitle || emp.designation}</TableCell>
                {[...Array(daysInMonth).keys()].map(d => (
                  <TableCell key={d} align="center" sx={{minWidth: '150px'}}>
                    {shiftOptions.map(shift => (
                      <FormControlLabel
                        key={shift}
                        control={
                          <Checkbox 
                            checked={(shifts[emp.id]?.[d + 1] || []).includes(shift)}
                            onChange={() => handleCheckboxChange(emp.id, d + 1, shift)}
                            size="small"
                          />
                        }
                        label={<Typography variant="caption">{shift}</Typography>}
                        sx={{ display: 'block', margin: 0, padding: '2px'}}
                      />
                    ))}
                  </TableCell>
                ))}
                <TableCell sx={{ position: 'sticky', right: 0, zIndex: theme.zIndex.appBar + 1, backgroundColor: theme.palette.background.paper }}>
                  <Button variant="contained" color="success" onClick={() => handleSave(emp.id)} sx={{mr: 1}}>
                    {isEditMode ? 'Update' : 'Create'}
                  </Button>
                  {!isEditMode && (
                    <Button variant="outlined" color="error" onClick={() => handleClear(emp.id)}>Clear</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateRoaster;