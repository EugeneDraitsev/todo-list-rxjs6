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
    <div>
        <input data-item-id="${this.id}" type="checkbox" ${!this.isActive ? 'checked' : ''} toggle-active />
        <span ${!this.isActive ? 'style="text-decoration: line-through;"' : ''}>${this.text}</span>
        <button data-item-id="${this.id}" remove-button>x</button>
    </div>`
}
