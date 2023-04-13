import { makeAutoObservable } from 'mobx'
import { createContext, FC, PropsWithChildren, useContext } from 'react'

export class RootStore {
  constructor() {
    makeAutoObservable(this)
  }

  isDockOpen = false
  openDock = () => (this.isDockOpen = true)
  closeDock = () => {
    console.log('Fire!')
    this.isDockOpen = false
  }
}

const rootStore = new RootStore()

export interface ChildStore {
  root?: RootStore
  parent?: ChildStore
}

export const RootStoreContext = createContext(rootStore)

export const RootStoreProvider: FC<PropsWithChildren> = ({ children }) => (
  <RootStoreContext.Provider value={rootStore}>
    {' '}
    {children}
  </RootStoreContext.Provider>
)

export const useRootStore = () => useContext(RootStoreContext)
