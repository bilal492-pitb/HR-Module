module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middleName: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY
    },
    maritalStatus: {
      type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed')
    },
    nationality: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING
    },
    alternatePhoneNumber: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    postalCode: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    jobTitle: {
      type: DataTypes.STRING
    },
    department: {
      type: DataTypes.STRING
    },
    supervisor: {
      type: DataTypes.STRING
    },
    employmentStatus: {
      type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern', 'Terminated')
    },
    joinDate: {
      type: DataTypes.DATEONLY
    },
    terminationDate: {
      type: DataTypes.DATEONLY
    },
    emergencyContactName: {
      type: DataTypes.STRING
    },
    emergencyContactRelation: {
      type: DataTypes.STRING
    },
    emergencyContactPhone: {
      type: DataTypes.STRING
    },
    profilePicture: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  Employee.associate = function(models) {
    // Associations with other models
    Employee.hasMany(models.Qualification, { 
      foreignKey: 'employeeId', 
      as: 'qualifications' 
    });
    
    Employee.hasMany(models.Dependent, { 
      foreignKey: 'employeeId', 
      as: 'dependents' 
    });
    
    Employee.hasMany(models.Training, { 
      foreignKey: 'employeeId', 
      as: 'trainings' 
    });
    
    Employee.hasMany(models.MedicalRecord, { 
      foreignKey: 'employeeId', 
      as: 'medicalRecords' 
    });
    
    Employee.hasMany(models.SalaryHistory, { 
      foreignKey: 'employeeId', 
      as: 'salaryHistory' 
    });
    
    Employee.hasOne(models.BankDetail, { 
      foreignKey: 'employeeId', 
      as: 'bankDetails' 
    });
    
    Employee.hasMany(models.Leave, { 
      foreignKey: 'employeeId', 
      as: 'leaves' 
    });
    
    Employee.hasMany(models.Asset, { 
      foreignKey: 'employeeId', 
      as: 'assets' 
    });
    
    Employee.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Employee;
}; 