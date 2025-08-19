import express from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} from "../controllers/employeeController";
import { authenticationToken } from "../middleware/authMiddleware.ts";

const employeeRouter = express.Router();

employeeRouter.post(
  "/:slug/employees/create",
  authenticationToken,
  createEmployee
);
employeeRouter.get("/:slug/employees", authenticationToken, getEmployees);
employeeRouter.get(
  "/:slug/employees/:id",
  authenticationToken,
  getEmployeeById
);
employeeRouter.patch(
  "/:slug/employees/:id",
  authenticationToken,
  updateEmployee
);
employeeRouter.delete(
  "/:slug/employees/:id",
  authenticationToken,
  deleteEmployee
);

export default employeeRouter;
