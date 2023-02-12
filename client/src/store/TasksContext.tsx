import { createContext, Dispatch, useContext, useReducer } from 'react';

export interface StateProps {
  id: number;
  text: string;
  done: boolean;
}

export interface ActionProps {
  type: "added" | "changed" | "deleted";
  payload: StateProps;
}


const TasksContext = createContext({} as StateProps[]);
export function useTasks() {
  return useContext(TasksContext);
}
const TasksDispatchContext = createContext({} as Dispatch<ActionProps>);
export function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

export function TasksProvider({ children }: { children: JSX.Element; }) {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}


function tasksReducer(tasks: StateProps[], action: ActionProps) {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.payload.id,
        text: action.payload.text,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.payload.id) {
          return action.payload;
        } else {
          return action.payload;
        }
      });
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.payload.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const initialTasks: StateProps[] = [
  { id: 0, text: 'Philosopher’s Path', done: true },
  { id: 1, text: 'Visit the temple', done: false },
  { id: 2, text: 'Drink match', done: false }
];
