import { fromEvent } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import Filters from './Filters'

export default class TodoList {
  list = []

  constructor(todoStore, filterStore, rootSelector) {
    this.rootSelector = rootSelector
    this.rootSelector.innerHTML = `
      <div style="display: flex">
        <div arrow style="width: 10px; padding: 5px; transform: rotate(90deg);">></div>
        <input main-input placeholder="What needs to be done?" />
      </div>
      <div content></div>
    `
    this.input = this.rootSelector.querySelector('[main-input]')
    this.content = this.rootSelector.querySelector('[content]')
    this.arrow = this.rootSelector.querySelector('[arrow]')

    this.filterBlock = new Filters(todoStore, filterStore, this.content)

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
    this.content.innerHTML = `
      <div>${this.list.filter(this.filter.fn).map(todo => todo.getHtml()).join('')}</div>
      ${this.filterBlock.getHtml()}
     `
    this.arrow.style.opacity = this.isAllActive() ? '1' : '0.5'
    this.arrow.style.display = this.list.length ? 'block' : 'none'
  }
}
