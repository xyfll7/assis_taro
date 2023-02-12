import { createContext, Dispatch, useContext, useReducer } from "react";

const initialData: BaseUserInfo | null = null;
const Context = createContext([null, {}] as [BaseUserInfo | null, Dispatch<BaseUserInfo | null>]);
export function useSelfInfo() {
  return useContext(Context);
}

export function SelfInfoProvider({ children }: { children: JSX.Element; }) {
  const [data, dispatch] = useReducer(reducer, initialData);
  return <Context.Provider value={[data, dispatch]}>{children}</Context.Provider>;
}

function reducer(oldValue: BaseUserInfo | null, newValue: BaseUserInfo | null): BaseUserInfo | null {
  return { ...oldValue, ...newValue };
}
