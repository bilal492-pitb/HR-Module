module.exports = (sequelize, DataTypes) => {
  const BankDetail = sequelize.define('BankDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountType: {
      type: DataTypes.ENUM('Checking', 'Savings', 'Current', 'Other'),
      defaultValue: 'Checking'
    },
    branchName: {
      type: DataTypes.STRING
    },
    branchCode: {
      type: DataTypes.STRING
    },
    routingNumber: {
      type: DataTypes.STRING
    },
    swiftCode: {
      type: DataTypes.STRING
    },
    ifscCode: {
      type: DataTypes.STRING
    },
    taxId: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  BankDetail.associate = function(models) {
    BankDetail.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return BankDetail;
}; 