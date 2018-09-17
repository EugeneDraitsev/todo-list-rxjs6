import { fromEvent } from 'rxjs'
import { filter } from 'rxjs/operators'

export default class Filters {
  list = []

  constructor(todoStore, filterStore, rootSelector) {
    this.rootSelector = rootSelector

    filterStore.store.subscribe(filter => this.filter = filter)
    todoStore.store.subscribe(todoList => this.list = todoList)

    // on all button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('all-button')),
    ).subscribe(filterStore.actions.filterAll)

    // on active button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('active-button')),
    ).subscribe(filterStore.actions.filterActive)

    // on completed button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('completed-button')),
    ).subscribe(filterStore.actions.filterCompleted)

    // on clear completed
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('clear-completed')),
    ).subscribe(todoStore.actions.clearCompleted)
  }

  getActive = () => this.list.filter(x => x.isActive).length
  isSomeCompleted = () => this.list.some(x => !x.isActive)

  getHtml = () => {
    const activeCount = this.getActive()
    return `
      <div ${!this.list.length ? 'style="display: none;"' : ''}>
         ${activeCount} ${activeCount === 1 ? 'item' : 'items'} left
         <span ${this.filter.value === 'All' ? 'style="border: 1px solid gold"' : ''} all-button>All</span>
         <span ${this.filter.value === 'Active' ? 'style="border: 1px solid gold"' : ''} active-button>Active</span>
         <span ${this.filter.value === 'Completed' ? 'style="border: 1px solid gold"' : ''} completed-button>Completed</span>
         <span ${!this.isSomeCompleted() ? 'style="display: none"' : ''} clear-completed>Clear completed</span>
      </div>
     `
  }
}
