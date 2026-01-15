export default class History {
  constructor(maxDepth = 50) {
    this.maxDepth = maxDepth;
    this.items = [];
    this.index = -1;
  }

  push(item) {
    if (this.getCurrent() === item) return;

    this.items = this.items.slice(0, this.index + 1);
    this.items.push(item);
    this.index = this.items.length - 1;

    if (this.items.length > this.maxDepth) {
      this.items.shift();
      this.index--;
    }
  }

  get(index) {
    return this.items[index];
  }

  getCurrent() {
    return this.items[this.index];
  }

  canGoBack() {
    return this.index > 0;
  }

  canGoForward() {
    return this.index < this.items.length - 1;
  }

  backward() {
    console.log('backward() called, current index:', this.index, 'items:', this.items);
    if (this.canGoBack()) {
      this.index--;
      console.log('new index:', this.index, 'returning:', this.getCurrent());
      return this.getCurrent();
    }
    return null;
  }

  forward() {
    console.log('forward() called, current index:', this.index, 'items:', this.items);
    if (this.canGoForward()) {
      this.index++;
      console.log('new index:', this.index, 'returning:', this.getCurrent());
      return this.getCurrent();
    }
    console.log('cannot go forward');
    return null;
  }

  getAll() {
    return [...this.items];
  }

  get length() {
    return this.items.length;
  }

  clear() {
    this.items = [];
    this.index = -1;
  }
}