import { Router } from "express";
import {
    addExpense,
    deleteExpense,
    getCategoryWise,
    getExpense,
    getExpenses,
    getExpenseSummary,
    getMonthlyExpense,
    updateExpense,
} from "../controllers/expense.controllers.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);
router.route("/").get(getExpenses).post(addExpense);
router.get("/monthly", getMonthlyExpense);
router.get("/categorywise", getCategoryWise);
router.get("/summary", getExpenseSummary);
router.route("/:expenseId").get(getExpense).patch(updateExpense).delete(deleteExpense);

export default router;