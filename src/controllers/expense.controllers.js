import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Expense } from "../models/expense.models.js";

const addExpense = asyncHandler(async (req, res) => {
    const { amount, title, date, paymentMethod } = req.body;

    if (amount === undefined || !title?.trim()) {
        throw new ApiError(400, "Amount and title are required");
    }

    const expense = await Expense.create({
        amount,
        title: title.trim(),
        date,
        paymentMethod,
        user: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, expense, "Expense added successfully"));
});

const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, _id: -1 });
    return res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const getExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.expenseId, user: req.user._id });
    if (!expense) throw new ApiError(404, "Expense not found");
    return res.status(200).json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

const updateExpense = asyncHandler(async (req, res) => {
    const updates = {};
    const { amount, title, date, paymentMethod } = req.body;
    if (amount !== undefined) updates.amount = amount;
    if (title !== undefined) updates.title = title.trim();
    if (date !== undefined) updates.date = date;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (Object.keys(updates).length === 0) throw new ApiError(400, "At least one expense field is required");
    if (updates.title === "") throw new ApiError(400, "Title cannot be empty");

    const expense = await Expense.findOneAndUpdate(
        { _id: req.params.expenseId, user: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!expense) throw new ApiError(404, "Expense not found");
    return res.status(200).json(new ApiResponse(200, expense, "Expense updated successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.expenseId, user: req.user._id });
    if (!expense) throw new ApiError(404, "Expense not found");
    return res.status(200).json(new ApiResponse(200, expense, "Expense deleted successfully"));
});

export { addExpense, getExpenses, getExpense, updateExpense, deleteExpense };
