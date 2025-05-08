module.exports = (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    recordType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    providerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    confidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'medical_records'
  });

  MedicalRecord.associate = (models) => {
    MedicalRecord.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return MedicalRecord;
}; 