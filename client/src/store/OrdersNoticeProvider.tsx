import { createContext, Dispatch, useContext, useReducer } from 'react';

const initialData: ProductBase[] | null = null;
const Context = createContext([null, {}] as [ProductBase[] | null, Dispatch<ProductBase[] | null>]);

function reducer(_: any, action: ProductBase[] | null): ProductBase[] | null {
  return action ?? null;
}

export function useOrdersNotice() {
  return useContext(Context);
}

export function OrdersNoticeProvider({ children }: { children: JSX.Element; }) {
  const [data, dispatch] = useReducer(reducer, initialData);
  return (
    <Context.Provider value={[data, dispatch]}>
      {children}
    </Context.Provider>
  );
}


