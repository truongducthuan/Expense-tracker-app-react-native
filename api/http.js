import axios from "axios";
import { FIREBASE_DB_URL as URL } from "./config";

// Expense
export const storeExpense = async (expense) => {
  const res = await axios.post(`${URL}/expenses.json`, expense);
  const id = res.data.name;
  return id;
};

export const fetchExpenses = async () => {
  const res = await axios.get(`${URL}/expenses.json`);
  const expenses = [];
  for (const key in res.data) {
    const expense = {
      id: key,
      amount: +res.data[key].amount,
      date: new Date(res.data[key].date),
      desc: res.data[key].desc,
      category: res.data[key].category,
      account: res.data[key].account,
      type: res.data[key].type,
      year: res.data[key].year,
      user: res.data[key].user,
    };
    expenses.push(expense);
  }

  return expenses;
};

export const updateExpenses = async (id, expense) => {
  const res = await axios.put(`${URL}/expenses/${id}.json`, expense);
  return res;
};

export const deleteExpenses = async (id) => {
  return axios.delete(`${URL}/expenses/${id}.json`);
};
