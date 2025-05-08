module.exports = (sequelize, DataTypes) => {
  const Dependent = sequelize.define('Dependent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relationship: {
      type: DataTypes.ENUM('Spouse', 'Child', 'Parent', 'Sibling', 'Other'),
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    contactNumber: {
      type: DataTypes.STRING
    },
    isEmergencyContact: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    address: {
      type: DataTypes.TEXT
    },
    isBeneficiary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  Dependent.associate = function(models) {
    Dependent.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return Dependent;
}; 