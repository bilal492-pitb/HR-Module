module.exports = app => {
  const medicalRecords = require("../controllers/medicalRecord.controller.js");
  const { authJwt } = require("../middleware");
  const router = require("express").Router();
  
  // Apply middleware to check authentication for all routes
  router.use(authJwt.verifyToken);
  
  // Create a new Medical Record for an employee
  router.post("/employees/:employeeId/medical-records", medicalRecords.create);
  
  // Retrieve all Medical Records for an employee
  router.get("/employees/:employeeId/medical-records", medicalRecords.findAll);
  
  // Retrieve a single Medical Record by id for an employee
  router.get("/employees/:employeeId/medical-records/:id", medicalRecords.findOne);
  
  // Update a Medical Record for an employee
  router.put("/employees/:employeeId/medical-records/:id", medicalRecords.update);
  
  // Delete a Medical Record for an employee
  router.delete("/employees/:employeeId/medical-records/:id", medicalRecords.delete);
  
  app.use("/api", router);
}; 