export const TODO_LOCAL_STORAGE_KEY = 'todo';

export const loadFromLocalStorage = (todoStore) => {
  try {
    const initialTodo = JSON.parse(localStorage.getItem(TODO_LOCAL_STORAGE_KEY));
    if (initialTodo && initialTodo.length) {
      initialTodo.forEach((todo) => todoStore.actions.add(todo));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

export const parseUrlLocation = (filterStore) => {
  const { hash } = window.location;
  switch (hash.replace('#/', '')) {
    case 'active': {
      filterStore.actions.filterActive();
      break;
    }
    case 'completed': {
      filterStore.actions.filterCompleted();
      break;
    }

    default: {
      filterStore.actions.filterAll();
      break;
    }
  }
};
