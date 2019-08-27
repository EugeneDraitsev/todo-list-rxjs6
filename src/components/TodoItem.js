import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export default class TodoItem {
  constructor(todo, todoStore) {
    const { text, isActive = true } = todo;
    this.id = TodoItem.generateId();
    this.text = text;
    this.isActive = isActive;
    this.editing = false;
    this.subscriptions = [];

    // on-remove form list
    this.subscriptions.push(
      todoStore.store.subscribe((todoList) => {
        if (!todoList.includes(this) && this.subscriptions.length) {
          this.onRemove();
        }
      }),
    );

    // on checkbox
    this.subscriptions.push(
      fromEvent(document, 'click').pipe(
        filter((e) => e.target.dataset.itemId === this.id),
        filter((e) => e.target.hasAttribute('toggle-active')),
        map((e) => e.target.dataset.itemId),
      ).subscribe(todoStore.actions.toggleActive),
    );

    // on remove
    this.subscriptions.push(
      fromEvent(document, 'click').pipe(
        filter((e) => e.target.dataset.itemId === this.id),
        filter((e) => e.target.hasAttribute('remove-button')),
        map((e) => e.target.dataset.itemId),
      ).subscribe(todoStore.actions.remove),
    );

    // on edit enable
    this.subscriptions.push(
      fromEvent(document, 'dblclick').pipe(
        // tap(console.log),
        filter((e) => e.target.dataset.itemId === this.id),
        filter((e) => e.target.hasAttribute('text-label')),
        map((e) => e.target.dataset.itemId),
      ).subscribe((id) => {
        todoStore.actions.enableEdit(id);
        const input = document.querySelector(`[text-input][data-item-id=${this.id}]`);
        // hax for focus end of string
        const inputValue = input.value;
        input.focus();
        input.value = '';
        input.value = inputValue;
      }),
    );

    // on edit cancel
    this.subscriptions.push(
      fromEvent(document, 'click').pipe(
        filter(() => this.editing),
        filter((e) => !e.target.hasAttribute('text-input')),
      ).subscribe(() => todoStore.actions.cancelEdit(this.id)),
    );

    this.subscriptions.push(
      fromEvent(document, 'keyup').pipe(
        filter(() => this.editing),
        filter((e) => e.key === 'Escape'),
      ).subscribe(() => todoStore.actions.cancelEdit(this.id)),
    );

    // on edit save
    this.subscriptions.push(
      fromEvent(document, 'keyup').pipe(
        filter(() => this.editing),
        filter((e) => e.key === 'Enter'),
        map((e) => e.target.value),
      ).subscribe((newText) => todoStore.actions.changeText({ id: this.id, text: newText })),
    );
  }

  static generateId = () => `id${Math.random().toString(36).substr(2, 9)}`;

  toggleActive = () => {
    this.isActive = !this.isActive;
    return this;
  };

  enableEdit = () => {
    this.editing = true;
    return this;
  };

  cancelEdit = () => {
    this.editing = false;
    return this;
  };

  setActive = (isActive) => {
    this.isActive = isActive;
    return this;
  };

  setText = (text) => {
    this.text = text;
    this.editing = false;
    return this;
  };

  onRemove = () => {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  };

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
