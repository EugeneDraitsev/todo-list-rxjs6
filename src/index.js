import { createStore } from './store'
import TodoItem from './components/TodoItem'
import TodoList from './components/TodoList'

const todoStore = createStore([], {
  add: text => list => [new TodoItem(text, todoStore), ...list],
  remove: id => list => list.filter(x => x.id !== id),
  toggleActive: id => list => list.map(x => x.id === id ? x.toggleActive() : x),
  clearCompleted: () => list => list.filter(x => x.isActive),
  toggleAll: () => (list) => {
    const isSomeActive = list.some(x => x.isActive)
    return list.map(x => x.setActive(!isSomeActive))
  },
})

const initialFilter = { value: 'All', fn: () => true }
const filterStore = createStore(initialFilter, {
  filterAll: () => () => initialFilter,
  filterActive: () => () => ({ value: 'Active', fn: x => x.isActive }),
  filterCompleted: () => () => ({ value: 'Completed', fn: x => !x.isActive }),
})

// application entry point
new TodoList(todoStore, filterStore, document.querySelector('#root'))
