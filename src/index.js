import { from, fromEvent, Subject, BehaviorSubject } from 'rxjs'
import { scan, map, filter, tap, mergeMap, flatMap, switchMap, merge } from 'rxjs/operators'

function createStore(initialState = {}, reducers = {}) {
  let streams = {}, actions = {}, store

  for (let action in reducers) {
    let subject = new Subject()
    streams[`${action}$`] = subject.pipe(map(reducers[action]))
    actions[action] = (args) => subject.next(args)
  }

  store = new BehaviorSubject(initialState).pipe(
    merge(...Object.values(streams)),
    scan((state, reducer) => reducer(state)),
  )

  return { store, actions }
}

const todoStore = createStore([], {
  add: (text) => (list = []) => [new TodoItem(text), ...list],
  remove: (id) => (list = []) => list.filter(x => x.id !== id),
  toggleActive: (id) => (list = []) => list.map(x => x.id === id ? x.toggleActive() : x),
  toggleAll: () => (list = []) => {
    const isSomeActive = list.some(x => x.isActive)
    return list.map(x => x.setActive(!isSomeActive))
  },
})

const initialFilter = { value: 'All', fn: x => true }
const filterStore = createStore(initialFilter, {
  filterAll: () => () => ({ value: 'All', fn: x => true }),
  filterActive: () => () => ({ value: 'Active', fn: x => x.isActive }),
  filterCompleted: () => () => ({ value: 'Completed', fn: x => !x.isActive }),
})

class TodoList {
  list = []
  filter = initialFilter

  constructor() {
    this.input = document.querySelector('#main-input')
    this.content = document.querySelector('#content')
    this.arrow = document.querySelector('#arrow')

    todoStore.store.subscribe((todoList) => {
      console.log(todoList)
      this.list = todoList
      this.updateHTML()
    })

    filterStore.store.subscribe((filter) => {
      this.filter = filter
      this.updateHTML()
    })

    // on enter press
    fromEvent(this.input, 'keyup').pipe(
      filter(e => e.key === 'Enter'),
      map(e => e.target.value),
      tap(() => this.input.value = ''),
    ).subscribe(todoList => todoStore.actions.add(todoList))

    // on checkbox
    fromEvent(this.content, 'click').pipe(
      filter(e => e.target.hasAttribute('toggle-active')),
      map(e => e.target.parentNode.dataset.itemId),
    ).subscribe(todoStore.actions.toggleActive)

    // on remove
    fromEvent(this.content, 'click').pipe(
      filter(e => e.target.hasAttribute('remove-button')),
      map(e => e.target.parentNode.dataset.itemId),
    ).subscribe(todoStore.actions.remove)

    // on all button
    fromEvent(this.content, 'click').pipe(
      filter(e => e.target.hasAttribute('all-button')),
    ).subscribe(filterStore.actions.filterAll)

    // on active button
    fromEvent(this.content, 'click').pipe(
      filter(e => e.target.hasAttribute('active-button')),
    ).subscribe(filterStore.actions.filterActive)

    // on completed button
    fromEvent(this.content, 'click').pipe(
      filter(e => e.target.hasAttribute('completed-button')),
    ).subscribe(filterStore.actions.filterCompleted)

    // on arrow
    fromEvent(this.arrow, 'click').subscribe(todoStore.actions.toggleAll)
  }

  getActive = () => this.list.filter(x => x.isActive).length
  isAllActive = () => this.list.every(x => x.isActive)

  updateHTML = () => {
    const active = this.getActive()
    this.content.innerHTML = `
      <div>${this.list.filter(this.filter.fn).map(todo => todo.getHtml()).join('')}</div>
      <div ${!this.list.length ? 'style="display: none;"' : ''}>
         ${active} ${active === 1 ? 'item' : 'items'} left
         <span ${this.filter.value === 'All' ? 'style="border: 1px solid gold"' : ''} all-button>All</span>
         <span ${this.filter.value === 'Active' ? 'style="border: 1px solid gold"' : ''} active-button>Active</span>
         <span ${this.filter.value === 'Completed' ? 'style="border: 1px solid gold"' : ''} completed-button>Completed</span>
      </div>
     `
    this.arrow.style.opacity = this.isAllActive() ? '1' : '0.5'
    this.arrow.style.display = this.list.length ? 'block' : 'none'
  }
}

class TodoItem {
  constructor(text) {
    this.id = TodoItem.generateId()
    this.text = text
    this.isActive = true
  }

  static generateId = () => `id${Math.random().toString(36).substr(2, 9)}`

  toggleActive = () => {
    this.isActive = !this.isActive
    return this
  }

  setActive = (isActive) => {
    this.isActive = isActive
    return this
  }

  getHtml = () => `
    <div data-item-id="${this.id}">
        <input type="checkbox" ${!this.isActive ? 'checked' : ''} toggle-active />
        <span ${!this.isActive ? 'style="text-decoration: line-through;"' : ''}>${this.text}</span>
        <button remove-button>x</button>
    </div>`
}

const list = new TodoList()
