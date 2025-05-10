import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  MedicalServices as MedicalServicesIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  Laptop as LaptopIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getStoredEmployees } from '../../utils/storageUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ICTChartReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch from localStorage
      const storedEmployees = getStoredEmployees();
      const foundEmployee = storedEmployees.find(emp => emp.id.toString() === id.toString());
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
      } else {
        setError('Employee not found');
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Error fetching employee details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Full-Time':
        return 'success';
      case 'Part-Time':
        return 'info';
      case 'Contract':
        return 'warning';
      case 'Intern':
        return 'secondary';
      case 'Terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle download as PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add multiple pages if needed
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`ICT_Chart_${employee.firstName}_${employee.lastName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!employee) {
    return (
      <Alert severity="error">Employee not found</Alert>
    );
  }

  return (
    <Box className="ict-chart-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4">ICT Chart Report</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{ mr: 2 }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Paper ref={reportRef} sx={{ p: 4, mb: 4 }} className="ict-chart-report">
        {/* Header with Logo and Title */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <img 
              src="/PAFDA.JPG" 
              alt="Company Logo" 
              style={{ height: 60, marginRight: 16 }} 
            />
            <Typography variant="h5" fontWeight="bold">Employee ICT Chart Report</Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Generated on: {format(new Date(), 'MMMM dd, yyyy')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Employee Basic Information */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Personal Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3} md={2}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar 
                  src={employee.profilePicture || '/avatar-placeholder.png'} 
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {`${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`}
                </Avatar>
                {employee.signature && (
                  <Box mt={1}>
                    <Typography variant="caption" display="block" gutterBottom>Signature</Typography>
                    <img 
                      src={employee.signature} 
                      alt="Signature" 
                      style={{ maxWidth: '100%', height: 40 }} 
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={9} md={10}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5">
                    {`${employee.firstName || ''} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName || ''}`}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    {employee.jobTitle || 'No Job Title'} - {employee.department || 'No Department'}
                  </Typography>
                  <Chip 
                    label={employee.employmentStatus || 'Not Specified'} 
                    color={getStatusColor(employee.employmentStatus)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                  <Typography variant="body1">{employee.employeeId || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{employee.email || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{employee.phoneNumber || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="body1">{formatDate(employee.dateOfBirth)}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Gender</Typography>
                  <Typography variant="body1">{employee.gender || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Marital Status</Typography>
                  <Typography variant="body1">{employee.maritalStatus || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Nationality</Typography>
                  <Typography variant="body1">{employee.nationality || 'Not specified'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={8}>
                  <Typography variant="body2" color="textSecondary">Address</Typography>
                  <Typography variant="body1">
                    {employee.address ? 
                      `${employee.address}, ${employee.city || ''} ${employee.state || ''} ${employee.postalCode || ''}, ${employee.country || ''}` : 
                      'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Employment Information */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
            <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Employment Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Department</Typography>
              <Typography variant="body1">{employee.department || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Job Title</Typography>
              <Typography variant="body1">{employee.jobTitle || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Employment Status</Typography>
              <Typography variant="body1">{employee.employmentStatus || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Join Date</Typography>
              <Typography variant="body1">{formatDate(employee.joinDate)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Appointment Grade</Typography>
              <Typography variant="body1">{employee.appointmentGrade || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">Reports To</Typography>
              <Typography variant="body1">{employee.supervisor || 'Not specified'}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Emergency Contact Information */}
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom sx={{ bgcolor: '#F5F5F5', p: 1 }}>
            Emergency Contact Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body1">{employee.emergencyContactName || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Relationship</Typography>
              <Typography variant="body1">{employee.emergencyContactRelation || 'Not specified'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">Phone</Typography>
              <Typography variant="body1">{employee.emergencyContactPhone || 'Not specified'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Qualifications */}
        {employee.qualifications && employee.qualifications.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Qualifications
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.qualifications.map((qualification) => (
                    <TableRow key={qualification.id}>
                      <TableCell>{qualification.qualificationType}</TableCell>
                      <TableCell>{qualification.qualificationName}</TableCell>
                      <TableCell>{qualification.institution}</TableCell>
                      <TableCell>{formatDate(qualification.startDate)}</TableCell>
                      <TableCell>{formatDate(qualification.endDate)}</TableCell>
                      <TableCell>{qualification.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Dependents */}
        {employee.dependents && employee.dependents.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dependents
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Relation</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>CNIC</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.dependents.map((dependent) => (
                    <TableRow key={dependent.id}>
                      <TableCell>{dependent.name}</TableCell>
                      <TableCell>{dependent.relation}</TableCell>
                      <TableCell>{dependent.contact}</TableCell>
                      <TableCell>{dependent.age}</TableCell>
                      <TableCell>{dependent.gender}</TableCell>
                      <TableCell>{dependent.cnic}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Trainings */}
        {employee.trainings && employee.trainings.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Trainings
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Training Type</TableCell>
                    <TableCell>Training Name</TableCell>
                    <TableCell>Institute</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.trainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell>{training.trainingType}</TableCell>
                      <TableCell>{training.trainingName}</TableCell>
                      <TableCell>{training.institute}</TableCell>
                      <TableCell>{training.country}</TableCell>
                      <TableCell>
                        {training.durationFrom && training.durationTo
                          ? `${formatDate(training.durationFrom)} - ${formatDate(training.durationTo)}`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Leaves */}
        {employee.leaves && employee.leaves.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <EventNoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Leave Information
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Leave Count</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Limit</TableCell>
                    <TableCell>Update Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{leave.leaveCount}</TableCell>
                      <TableCell>{leave.leaveAvail}</TableCell>
                      <TableCell>{leave.leaveLimit}</TableCell>
                      <TableCell>{leave.updateType === 'automatic' ? 'Automatic' : 'Manual'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Medical Records */}
        {employee.medicalRecords && employee.medicalRecords.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <MedicalServicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Medical Records
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Record Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Follow-up Required</TableCell>
                    <TableCell>Confidential</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.medicalRecords
                    .filter(record => !record.isConfidential || record.isConfidential === false)
                    .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.recordType}</TableCell>
                      <TableCell>{formatDate(record.recordDate)}</TableCell>
                      <TableCell>{record.provider || 'N/A'}</TableCell>
                      <TableCell>{record.description || 'N/A'}</TableCell>
                      <TableCell>{record.followUpRequired ? 'Yes' : 'No'}</TableCell>
                      <TableCell>No</TableCell>
                    </TableRow>
                  ))}
                  {employee.medicalRecords
                    .filter(record => record.isConfidential)
                    .length > 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          {employee.medicalRecords.filter(record => record.isConfidential).length} confidential record(s) not shown
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Salary History */}
        {employee.salaryHistory && employee.salaryHistory.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Salary History
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Pay and Allowances</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.salaryHistory.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>{salary.payAndAllowances}</TableCell>
                      <TableCell>{salary.totalAmount}</TableCell>
                      <TableCell>{formatDate(salary.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Bank Details */}
        {employee.bankDetails && employee.bankDetails.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Bank Details
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Date Added</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.bankDetails.map((bankDetail) => (
                    <TableRow key={bankDetail.id}>
                      <TableCell>{bankDetail.bankName}</TableCell>
                      <TableCell>{bankDetail.accountNumber}</TableCell>
                      <TableCell>{formatDate(bankDetail.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Assets */}
        {employee.assets && employee.assets.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ bgcolor: '#E9F7FB', p: 1 }}>
              <LaptopIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Assets
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Asset Type</TableCell>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Declared Date</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.assetType === 'movable' ? 'Movable' : 'Immovable'}</TableCell>
                      <TableCell>{asset.assetName}</TableCell>
                      <TableCell>{formatDate(asset.declaredDate)}</TableCell>
                      <TableCell>{asset.details || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Footer */}
        <Box mt={6} textAlign="center">
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            This is an official ICT Chart Report generated on {format(new Date(), 'MMMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Confidential - For authorized use only
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ICTChartReport; 