module.exports = (sequelize, DataTypes) => {
  const Leave = sequelize.define('Leave', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leaveType: {
      type: DataTypes.ENUM('Annual', 'Sick', 'Maternity', 'Paternity', 'Bereavement', 'Unpaid', 'Compensatory', 'Other'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalDays: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
      defaultValue: 'Pending'
    },
    appliedDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    approvedBy: {
      type: DataTypes.STRING
    },
    approvedDate: {
      type: DataTypes.DATEONLY
    },
    rejectionReason: {
      type: DataTypes.TEXT
    },
    attachmentUrl: {
      type: DataTypes.STRING
    },
    halfDayOption: {
      type: DataTypes.ENUM('None', 'First Half', 'Second Half'),
      defaultValue: 'None'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  Leave.associate = function(models) {
    Leave.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
      onDelete: 'CASCADE'
    });
  };

  return Leave;
}; 