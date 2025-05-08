module.exports = (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recordType: {
      type: DataTypes.ENUM('Health Check', 'Vaccination', 'Injury', 'Illness', 'Allergy', 'Medication', 'Other'),
      allowNull: false
    },
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATEONLY
    },
    description: {
      type: DataTypes.TEXT
    },
    provider: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
    results: {
      type: DataTypes.TEXT
    },
    documentUrl: {
      type: DataTypes.STRING
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATEONLY
    },
    notes: {
      type: DataTypes.TEXT
    },
    isConfidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true
  });

  MedicalRecord.associate = function(models) {
    MedicalRecord.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return MedicalRecord;
}; 