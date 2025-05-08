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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maritalStatus: {
      type: DataTypes.ENUM('Single', 'Married', 'Divorced', 'Widowed'),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employmentStatus: {
      type: DataTypes.ENUM('Active', 'On Leave', 'Terminated', 'Suspended'),
      allowNull: false,
      defaultValue: 'Active'
    },
    workLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    terminationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reportingManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    emergencyContactName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyContactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyContactRelation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Enables soft delete
    tableName: 'employees'
  });

  Employee.associate = (models) => {
    // Relationships
    Employee.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user' 
    });
    
    Employee.hasOne(models.BankDetail, {
      foreignKey: 'employeeId',
      as: 'bankDetails'
    });
    
    Employee.hasMany(models.Qualification, {
      foreignKey: 'employeeId',
      as: 'qualifications'
    });
    
    Employee.hasMany(models.Training, {
      foreignKey: 'employeeId',
      as: 'trainings'
    });
    
    Employee.hasMany(models.Dependent, {
      foreignKey: 'employeeId',
      as: 'dependents'
    });
    
    Employee.hasMany(models.MedicalRecord, {
      foreignKey: 'employeeId',
      as: 'medicalRecords'
    });
    
    Employee.hasMany(models.SalaryHistory, {
      foreignKey: 'employeeId',
      as: 'salaryHistory'
    });
    
    Employee.hasMany(models.Leave, {
      foreignKey: 'employeeId',
      as: 'leaves'
    });
    
    Employee.hasMany(models.Asset, {
      foreignKey: 'employeeId',
      as: 'assets'
    });
    
    // Self-reference for manager relationship
    Employee.belongsTo(Employee, {
      foreignKey: 'reportingManagerId',
      as: 'reportingManager'
    });
    
    Employee.hasMany(Employee, {
      foreignKey: 'reportingManagerId',
      as: 'subordinates'
    });
  };

  return Employee;
}; 