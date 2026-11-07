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

const getMonthlyExpense = asyncHandler(async (req, res) => {
    const expenses = await Expense.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                totalAmount: { $sum: "$amount" },
                expenseCount: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                totalAmount: 1,
                expenseCount: 1,
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, expenses, "Monthly expenses fetched successfully"));
});

const getCategoryWise = asyncHandler(async (req, res) => {
    const expenses = await Expense.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: "$paymentMethod",
                totalAmount: { $sum: "$amount" },
                expenseCount: { $sum: 1 },
            },
        },
        { $sort: { totalAmount: -1 } },
        {
            $project: {
                _id: 0,
                category: "$_id",
                totalAmount: 1,
                expenseCount: 1,
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, expenses, "Category-wise expenses fetched successfully"));
});

const getExpenseSummary = asyncHandler(async (req, res) => {
    const [summary] = await Expense.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                expenseCount: { $sum: 1 },
                averageAmount: { $avg: "$amount" },
            },
        },
        {
            $project: {
                _id: 0,
                totalAmount: 1,
                expenseCount: 1,
                averageAmount: 1,
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(
        200,
        summary ?? { totalAmount: 0, expenseCount: 0, averageAmount: 0 },
        "Expense summary fetched successfully"
    ));
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

export {
    addExpense,
    getExpenses,
    getExpense,
    getMonthlyExpense,
    getCategoryWise,
    getExpenseSummary,
    updateExpense,
    deleteExpense,
};