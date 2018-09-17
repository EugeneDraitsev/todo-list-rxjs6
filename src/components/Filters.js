import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export default class Filters {
  list = []

  constructor(todoStore, filterStore, rootSelector) {
    this.rootSelector = rootSelector;

    filterStore.store.subscribe(filterValue => this.filter = filterValue);
    todoStore.store.subscribe(todoListValue => this.list = todoListValue);

    // on all button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('all-button')),
    ).subscribe(filterStore.actions.filterAll);

    // on active button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('active-button')),
    ).subscribe(filterStore.actions.filterActive);

    // on completed button
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('completed-button')),
    ).subscribe(filterStore.actions.filterCompleted);

    // on clear completed
    fromEvent(this.rootSelector, 'click').pipe(
      filter(e => e.target.hasAttribute('clear-completed')),
    ).subscribe(todoStore.actions.clearCompleted);
  }

  getActive = () => this.list.filter(x => x.isActive).length

  isSomeCompleted = () => this.list.some(x => !x.isActive)

  getHtml = () => {
    const activeCount = this.getActive();
    return `
      <footer class="footer" ${!this.list.length ? 'style="display: none;"' : ''}>
        <span class="todo-count"><strong>${activeCount}</strong> ${activeCount === 1 ? 'item' : 'items'} left</span>
        <ul class="filters">
          <li>
            <a all-button class="${this.filter.value === 'All' ? 'selected' : ''}" href="#/">All</a>
          </li>
          <li>
            <a active-button class="${this.filter.value === 'Active' ? 'selected' : ''}" href="#/active">Active</a>
          </li>
          <li>
            <a completed-button class="${this.filter.value === 'Completed' ? 'selected' : ''}" href="#/completed">
              Completed
            </a>
          </li>
        </ul>
        <!-- Hidden if no completed items are left ↓ -->
        <button ${!this.isSomeCompleted() ? 'style="display: none"' : ''} clear-completed class="clear-completed">
          Clear completed
        </button>
      </footer>
     `;
  }
}
