import { set } from "mongoose";
import { createContext, useState, useContext, useMemo, Children } from "react";

const TaskContext = createContext();
export const TaskProvider = ({Children})=>{

    const [tasks, setTasks] = useState([]);

    const addTask = (title, description)=> {
        const newTask ={
            id: Date.now(),
            title,
            description,
            status:'pending',
            createdAt: new Data().toLocaleDataString(),
        };
        setTasks((prev) => [...prev, newTask]);
    };
    const deleteTask = (id) => {
        setTasks((prev)=> prev.filter((task) => task.id !== id));
    };

    const toggletaskStatus =  (id)=> {
        setTasks((prev) =>
     prev.map((task) =>
    task.id === id
    ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed'}
    :task
)
   );
    };

    const stats = useMemo (() =>{
        return{
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'completed').lenght,
        pending: tasks.filter((t) => t.status === 'pending').lenght,
        };
    }, [tasks]);
    return (
    <TaskContext.Provider value={{tasks, stats,addTask,deleteTask, toggletaskStatus}}>
        {Children}
    </TaskContext.Provider>
    );
    };
    export const useTasks = () => useContext(TaskContext);

