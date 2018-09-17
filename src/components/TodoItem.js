import { fromEvent } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export default class TodoItem {
  constructor(text, todoStore) {
    this.id = TodoItem.generateId()
    this.text = text
    this.isActive = true
    this.editing = false

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

    // on edit enable
    fromEvent(document, 'dblclick').pipe(
      // tap(console.log),
      filter(e => e.target.dataset.itemId === this.id),
      filter(e => e.target.hasAttribute('text-label')),
      map(e => e.target.dataset.itemId),
    ).subscribe((id) => {
      todoStore.actions.enableEdit(id)
      const input = document.querySelector(`[text-input][data-item-id=${this.id}]`)
      // hax for focus end of string
      const inputValue = input.value
      input.focus()
      input.value = ''
      input.value = inputValue
    })

    // on edit cancel
    fromEvent(document, 'click').pipe(
      filter(() => this.editing),
      filter(e => !e.target.hasAttribute('text-input')),
    ).subscribe(() => todoStore.actions.cancelEdit(this.id))

    fromEvent(document, 'keyup').pipe(
      filter(() => this.editing),
      filter(e => e.key === 'Escape'),
    ).subscribe(() => todoStore.actions.cancelEdit(this.id))

    // on edit save
    fromEvent(document, 'keyup').pipe(
      filter(() => this.editing),
      filter(e => e.key === 'Enter'),
      map(e => e.target.value),
    ).subscribe(text => todoStore.actions.changeText({ id: this.id, text }))
  }

  static generateId = () => `id${Math.random().toString(36).substr(2, 9)}`

  toggleActive = () => {
    this.isActive = !this.isActive
    return this
  }

  enableEdit = () => {
    this.editing = true
    return this
  }

  cancelEdit = () => {
    this.editing = false
    return this
  }

  setActive = (isActive) => {
    this.isActive = isActive
    return this
  }

  setText = (text) => {
    this.text = text
    this.editing = false
    return this
  }

  getHtml = () => `
    <li class="${!this.isActive ? 'completed' : ''} ${this.editing ? 'editing' : ''}">
      <div class="view">
        <input data-item-id="${this.id}" ${!this.isActive ? 'checked' : ''} type="checkbox" class="toggle" toggle-active>
        <label data-item-id="${this.id}" text-label>${this.text}</label>
        <button data-item-id="${this.id}" class="destroy" remove-button></button>
      </div>
      <input data-item-id="${this.id}" class="edit" value="${this.text}" text-input autofocus>
    </li>
    `
}
