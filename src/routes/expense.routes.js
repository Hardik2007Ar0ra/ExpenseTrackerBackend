import { Router } from "express";
import { addExpense, deleteExpense, getExpense, getExpenses, updateExpense } from "../controllers/expense.controllers.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);
router.route("/").get(getExpenses).post(addExpense);
router.route("/:expenseId").get(getExpense).patch(updateExpense).delete(deleteExpense);

export default router;
