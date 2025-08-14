import express from 'express'
import { createEmployee } from '../controllers/employeeController.ts'
import { getEmployees } from '../controllers/employeeController.ts'
import { getEmployeeById } from '../controllers/employeeController.ts'
import { updateEmployee } from '../controllers/employeeController.ts'
import { deleteEmployee } from '../controllers/employeeController.ts'

const employeeRouter = express.Router()

employeeRouter.post('/employee/create', createEmployee)
employeeRouter.get('/employee', getEmployees)
employeeRouter.get('/employee/:id', getEmployeeById)
employeeRouter.patch('/employee/update', updateEmployee)
employeeRouter.delete('/employee/delete/:id', deleteEmployee)

export default employeeRouter