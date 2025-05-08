module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true // Can be null if the asset is not assigned
    },
    assetType: {
      type: DataTypes.ENUM('Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer', 'Vehicle', 'Furniture', 'Other'),
      allowNull: false
    },
    assetName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assetTag: {
      type: DataTypes.STRING,
      unique: true
    },
    serialNumber: {
      type: DataTypes.STRING
    },
    manufacturer: {
      type: DataTypes.STRING
    },
    model: {
      type: DataTypes.STRING
    },
    purchaseDate: {
      type: DataTypes.DATEONLY
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2)
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    warrantyExpiry: {
      type: DataTypes.DATEONLY
    },
    condition: {
      type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged', 'Under Repair', 'Disposed'),
      defaultValue: 'New'
    },
    assignDate: {
      type: DataTypes.DATEONLY
    },
    returnDate: {
      type: DataTypes.DATEONLY
    },
    location: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('Available', 'Assigned', 'Under Maintenance', 'Retired', 'Lost'),
      defaultValue: 'Available'
    },
    documentUrl: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });

  Asset.associate = function(models) {
    Asset.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'SET NULL' // If employee is deleted, keep the asset record but set employeeId to null
    });
  };

  return Asset;
}; 