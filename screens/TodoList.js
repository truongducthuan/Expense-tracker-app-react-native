import { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { CalendarList } from "react-native-calendars";

import { getTodoList, updateTodo } from "../util/database";
import { TodoListStore } from "../store/todo/todoList";
import { addTodoListApi } from "../api/todo";
import { AuthStore } from "../store/authContext";
import IconButton from "../components/ui/IconButton";
import TodoItem from "../components/todoList/TodoItem";
import { checkFormat } from "../util/format";
import PrimaryButton from "../components/ui/PrimaryButton";
import useRefresh from "../hooks/useRefresh";

const TodoList = ({navigation}) => {
  const { setTodoList, todoList } = TodoListStore();
  const {user} = AuthStore();

  const [checkList, setCheckList] = useState([]);
  const [clock, setClock] = useState('');
  const [isCalendar, setIsCalendar] = useState(false);

  const fetchTodoList = () => {
    return getTodoList().then(res => {
      setTodoList(res)
      const todoDone = res.filter(todo => todo.isDone == 1);
      setCheckList(todoDone)
    }).catch(err => console.error(err))
  }

  const { refreshing, handleRefresh } = useRefresh(fetchTodoList);

  useEffect(() => {
    fetchTodoList();
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: calendar()
    });
  }, [])

  useEffect(() => {
    const createClock = () => {
      const currDate = new Date();
      const day = currDate.getDate();
      const month = currDate.getMonth() + 1;
      const hour = currDate.getHours();
      const minute = currDate.getMinutes();
      const second = currDate.getSeconds();
    
      const format = `${checkFormat(month)}/${checkFormat(day)} - ${checkFormat(hour)}:${checkFormat(minute)}:${checkFormat(second)}`
      setClock(format)
    }
    
    const intervalId = setInterval(createClock, 1000);

    return () => {
      clearInterval(intervalId)
    }
  }, [])


  const calendar = () => {
    return (
      <IconButton
        icon="calendar"
        size={24}
        color={'white'}
        onPress={() => {
          setIsCalendar((state) => !state);
        }}
      />
    )
  };

  const onCheck = async(todo) => {
    if(todo.isDone == 1) {
      await updateTodo(todo.name, 0, todo.id)
    }else {
      await updateTodo(todo.name, 1, todo.id)
    }
    fetchTodoList();
  }

  const styleColor = {
    backgroundColor: '#76f06d',
    borderRadius: 8,
  }

  const onSubmit = () => {
    const currDate = new Date();
    const data = {
      todoList: todoList,
      user: user.email,
      percent: Math.ceil((checkList.length / todoList.length) * 100),
      date: currDate
    }
    setCheckList([]);
    todoList.forEach(todo => {
      updateTodo(todo.name, 0,todo.id).then(() => {
        fetchTodoList();
      })
    });
    addTodoListApi(data).catch((err) => console.error(err));
  }

  if(isCalendar) {
    return (
      <View>
        <CalendarList />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.todoList}>
        <View style={styles.position}><AntDesign name="link" size={50} color="brown" /></View>
        <View style={[styles.title, styles.flexRow]}>
          <View>
            <Text>Today</Text>
            <Text>{clock}</Text>
          </View>
          <View style={[styles.flexRow]}>
            <Text>{checkList.length}/{todoList.length}</Text>
            <Text style={{color: '#12590d96'}}>completed</Text>
          </View>
        </View>
        <FlatList data={todoList} keyExtractor={(item) => item.id} renderItem={({item, index}) => <TodoItem item={item} index={index} onPress={() => onCheck(item)} style={styleColor} />} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} />

        <View>
          <Text style={{fontSize: 12, fontStyle: 'italic', color: '#2dab0a'}}>Please, submit your todo list at the end of the day!</Text>
          <PrimaryButton onPress={onSubmit} style={styles.btnSubmit}>Submit</PrimaryButton>
        </View>
      </View>
    </View>
  );
};

export default TodoList;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginLeft: 20
    // backgroundColor: GlobalStyles.colors.primary500,
  },
  todoList: {
    display: 'flex',
    position: 'relative',
    gap: 9,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: '#f9e6c9',
    borderRadius: 16,
    elevation: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  position: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5
  },
  btnSubmit: {
    // borderRadius: 10,
    marginTop: 4
  }
})
