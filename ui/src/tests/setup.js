import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Wails runtime
global.runtime = {
  EventsOn: vi.fn(),
  EventsOff: vi.fn(),
  EventsEmit: vi.fn()
}

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

global.localStorage = new LocalStorageMock()

// Enable manual mocking - Vitest will use __mocks__ directory
vi.mock('./fs/file.js')
vi.mock('./fs/vault.js')
vi.mock('./fs/assets.js')
vi.mock('./fs/window.js')

// Mock settings.json
vi.mock('../settings.json', () => ({
  default: {
    autoSaveInterval: 100,
    developmentMode: false,
    developmentSettings: {
      bypassLocalStorage: false
    }
  }
}))
