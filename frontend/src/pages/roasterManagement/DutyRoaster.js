import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SearchIcon from '@mui/icons-material/Search';
import { getStoredEmployees } from '../../utils/storageUtils';

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
  // month: 0-based
  return new Date(year, month + 1, 0).getDate();
};

const DutyRoaster = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setEmployees(getStoredEmployees());
    setRosters(getRosterData());
  }, []);

  const daysInMonth = getMonthDays(selectedYear, selectedMonth);
  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });

  const getEmployeeRoster = (empId) => {
    return rosters.find(r => r.employeeId === empId && r.year === selectedYear && r.month === selectedMonth);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm) ||
    (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm))
  );

  const handleEditRoster = (empId) => {
    navigate('/roaster/create', { state: { employeeId: empId, month: selectedMonth, year: selectedYear, editMode: true } });
  };

  const handleRepeatRoster = (empId) => {
    const currentRosterData = getEmployeeRoster(empId);
    if (!currentRosterData || !currentRosterData.shifts) {
      setSnackbar({ open: true, message: 'No roster data to repeat for this employee.', severity: 'warning' });
      return;
    }

    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;
    if (nextMonth > 11) { // Month is 0-indexed
      nextMonth = 0;
      nextYear += 1;
    }

    const newRosterEntry = {
      employeeId: empId,
      year: nextYear,
      month: nextMonth,
      shifts: { ...currentRosterData.shifts } // Create a copy of shifts
    };

    const allRosters = getRosterData();
    // Remove existing roster for the next month for this employee, if any
    const updatedRosters = allRosters.filter(r => !(r.employeeId === empId && r.year === nextYear && r.month === nextMonth));
    updatedRosters.push(newRosterEntry);
    saveRosterData(updatedRosters);

    // Update state to reflect changes if needed, or rely on next load
    setRosters(updatedRosters); 
    setSnackbar({ open: true, message: `Roster repeated to ${new Date(nextYear, nextMonth).toLocaleString('default', { month: 'long' })} ${nextYear}.`, severity: 'success' });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="primary" gutterBottom>Duty Roaster - {monthLabel} {selectedYear}</Typography>
        <Button variant="contained" color="success" onClick={() => navigate('/roaster/create')}>
          Create/Update Roaster
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2} mb={2}>
        <FormControl size="small">
          <InputLabel>Month</InputLabel>
          <Select value={selectedMonth} label="Month" onChange={e => setSelectedMonth(Number(e.target.value))}>
            {[...Array(12).keys()].map(m => (
              <MenuItem key={m} value={m}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(Number(e.target.value))}>
            {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2].map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search Employees..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      <Paper sx={{ overflowX: 'auto', width: '100%' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white', minWidth: 150 }}>Name</TableCell>
              <TableCell sx={{ position: 'sticky', left: 150, zIndex: 1, backgroundColor: 'white', minWidth: 120 }}>Department</TableCell>
              <TableCell sx={{ position: 'sticky', left: 270, zIndex: 1, backgroundColor: 'white', minWidth: 120 }}>Designation</TableCell>
              {[...Array(daysInMonth).keys()].map(d => (
                <TableCell key={d} align="center" sx={{ minWidth: 100 }}>{d + 1}</TableCell>
              ))}
              <TableCell sx={{ position: 'sticky', right: 0, zIndex: 1, backgroundColor: 'white', minWidth: 120 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map(emp => {
              const roster = getEmployeeRoster(emp.id);
              return (
                <TableRow key={emp.id}>
                  <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white' }}>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell sx={{ position: 'sticky', left: 150, zIndex: 1, backgroundColor: 'white' }}>{emp.department}</TableCell>
                  <TableCell sx={{ position: 'sticky', left: 270, zIndex: 1, backgroundColor: 'white' }}>{emp.jobTitle || emp.designation}</TableCell>
                  {[...Array(daysInMonth).keys()].map(d => {
                    const dayKey = d + 1;
                    const shiftsForDay = roster?.shifts?.[dayKey] || [];
                    return (
                      <TableCell key={d} align="center">
                        {shiftsForDay.length > 0 ? (
                          shiftsForDay.map(shift => (
                            <Chip key={shift} label={shift} size="small" sx={{ m: 0.2 }} />
                          ))
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ position: 'sticky', right: 0, zIndex: 1, backgroundColor: 'white' }} align="center">
                    <Tooltip title="Edit Roster">
                      <IconButton size="small" onClick={() => handleEditRoster(emp.id)} color="primary">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Repeat to Next Month">
                      <IconButton size="small" onClick={() => handleRepeatRoster(emp.id)} color="secondary">
                        <FileCopyIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DutyRoaster; 