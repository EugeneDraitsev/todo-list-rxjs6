import { Subject, BehaviorSubject } from 'rxjs'
import { scan, map, merge } from 'rxjs/operators'

export function createStore(initialState = {}, reducers = {}) {
  let streams = {}, actions = {}

  for (let action in reducers) {
    let subject = new Subject()
    streams[action] = subject.pipe(map(reducers[action]))
    actions[action] = (args) => subject.next(args)
  }

  const behaviorSubject = new BehaviorSubject(initialState).pipe(
    merge(...Object.values(streams)),
    scan((state, reducer) => reducer(state)),
  )

  const store = new BehaviorSubject({})
  behaviorSubject.subscribe(x => store.next(x))

  return { store, actions }
}
