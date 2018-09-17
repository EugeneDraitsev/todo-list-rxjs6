import { fromEvent } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import Filters from './Filters'

export default class TodoList {
  list = []

  constructor(todoStore, filterStore, rootSelector) {
    this.rootSelector = rootSelector
    this.rootSelector.innerHTML = `
      <header class="header">
       <h1>todos</h1>
       <div style="display: flex">
         <input class="new-todo" placeholder="What needs to be done?" autofocus main-input>
       </div>
      </header>
      <section class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" arrow>
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list" todo-list></ul>
      </section>
      <div filters></div>
    `
    this.input = this.rootSelector.querySelector('[main-input]')
    this.listNode = this.rootSelector.querySelector('[todo-list]')
    this.arrow = this.rootSelector.querySelector('[arrow]')
    this.filters = this.rootSelector.querySelector('[filters]')

    this.filterBlock = new Filters(todoStore, filterStore, this.filters)

    filterStore.store.subscribe((filter) => {
      this.filter = filter
      this.updateHTML()
    })

    todoStore.store.subscribe((todoList) => {
      this.list = todoList
      this.updateHTML()
    })

    // on enter press
    fromEvent(this.input, 'keyup').pipe(
      filter(e => e.key === 'Enter'),
      map(e => e.target.value),
      tap(() => this.input.value = ''),
    ).subscribe(todoList => todoStore.actions.add(todoList))

    // on arrow
    fromEvent(this.arrow, 'click').subscribe(todoStore.actions.toggleAll)
  }

  isAllActive = () => this.list.every(x => x.isActive)

  updateHTML = () => {
    this.listNode.innerHTML = `
      <div>${this.list.filter(this.filter.fn).map(todo => todo.getHtml()).join('')}</div>
     `
    this.filters.innerHTML = `${this.filterBlock.getHtml()}`
    // this.arrow.style.opacity = this.isAllActive() ? '1' : '0.5'
    // this.arrow.style.display = this.list.length ? 'block' : 'none'
  }
}
