interface Todo {
  id: number;
  text: string;
  due: Date;
}

function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const obj: Todo = {
  id: 123,
  text: "123213",
  due: new Date()
};

prop(obj, "due");
