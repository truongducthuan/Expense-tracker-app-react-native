import axios from "axios";
import { FIREBASE_DB_URL as URL } from "./config";

export const addTodoListApi = async (todo) => {
  const res = await axios.post(`${URL}/todo.json`, todo);
  const id = res.data.name;
  return id;
};

export const getTodoListApi = async() => {
  const res = await axios.get(`${URL}/todo.json`);
  const todo = [];
  for (const key in res.data) {
    const data = {
      id: key,
      date: res.data[key].date,
      todoList: res.data[key].todoList,
      percent: res.data[key].percent,
      user: res.data[key].user,
    };
    todo.push(data);
  }

  return todo;
}