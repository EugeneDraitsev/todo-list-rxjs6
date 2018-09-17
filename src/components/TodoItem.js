import { fromEvent } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export default class TodoItem {
  constructor(text, todoStore) {
    this.id = TodoItem.generateId()
    this.text = text
    this.isActive = true

    // on checkbox
    fromEvent(document, 'click').pipe(
      filter(e => e.target.dataset.itemId === this.id),
      filter(e => e.target.hasAttribute('toggle-active')),
      map(e => e.target.dataset.itemId),
    ).subscribe(todoStore.actions.toggleActive)

    // on remove
    fromEvent(document, 'click').pipe(
      filter(e => e.target.dataset.itemId === this.id),
      filter(e => e.target.hasAttribute('remove-button')),
      map(e => e.target.dataset.itemId),
    ).subscribe(todoStore.actions.remove)
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
    <li class="${!this.isActive ? 'completed' : ''}">
      <div class="view">
        <input data-item-id="${this.id}" ${!this.isActive ? 'checked' : ''} type="checkbox" class="toggle" toggle-active>
        <label>${this.text}</label>
        <button data-item-id="${this.id}" class="destroy" remove-button></button>
      </div>
      <input data-item-id="${this.id}" class="edit" value="Create a TodoMVC template" toggle-active>
    </li>
    `
}
