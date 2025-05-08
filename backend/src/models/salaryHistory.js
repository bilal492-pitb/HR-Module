module.exports = (sequelize, DataTypes) => {
  const SalaryHistory = sequelize.define('SalaryHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    effectiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    salaryAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    salaryType: {
      type: DataTypes.ENUM('Monthly', 'Annual', 'Hourly', 'Contract'),
      defaultValue: 'Monthly'
    },
    reason: {
      type: DataTypes.ENUM('Joining', 'Promotion', 'Annual Increment', 'Performance Bonus', 'Market Adjustment', 'Other'),
      allowNull: false
    },
    percentageIncrease: {
      type: DataTypes.DECIMAL(5, 2)
    },
    approvedBy: {
      type: DataTypes.STRING
    },
    approvalDate: {
      type: DataTypes.DATEONLY
    },
    bonusAmount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    allowances: {
      type: DataTypes.DECIMAL(10, 2)
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2)
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  SalaryHistory.associate = function(models) {
    SalaryHistory.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return SalaryHistory;
}; 