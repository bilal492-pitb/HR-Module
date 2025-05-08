module.exports = (sequelize, DataTypes) => {
  const Training = sequelize.define('Training', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trainingName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING
    },
    trainingType: {
      type: DataTypes.ENUM('Internal', 'External', 'Online', 'Conference', 'Workshop', 'Other'),
      defaultValue: 'Internal'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY
    },
    duration: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('Planned', 'In Progress', 'Completed', 'Cancelled'),
      defaultValue: 'Planned'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    certificate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    certificateUrl: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  Training.associate = function(models) {
    Training.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return Training;
}; 