module.exports = (sequelize, DataTypes) => {
  const Qualification = sequelize.define('Qualification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qualificationType: {
      type: DataTypes.ENUM('Degree', 'Certificate', 'License', 'Course', 'Other'),
      allowNull: false
    },
    qualificationName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY
    },
    endDate: {
      type: DataTypes.DATEONLY
    },
    grade: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    documentUrl: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });

  Qualification.associate = function(models) {
    Qualification.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return Qualification;
}; 