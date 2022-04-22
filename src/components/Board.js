import Cell from './Cell';
import { rotateMatrixClockwise, rotateMatrixCounterClockwise, reverseMatrix } from '../utils';
import DynamicComponent from './Dynamic';

export const EVENTS = {
  SWIPE: 'swipe',
  RESET: 'reset',
}

export default class Board extends DynamicComponent {
  constructor () {
    super();
  
    this._state = this.constructor.resetData();
    this._cells = Array.from(this.shadowRoot.querySelectorAll(Cell.tagName));

    this.element = null;
  }

  get state () {
    return this._state;
  }

  set state (newState) {
    this._state = newState;
  }

  static tagName = 'game-board';

  static get className () {
    return 'board';
  }

  static get selector () {
    return `js-${this.className}`;
  }

  static classList = [
    this.className,
    this.selector
  ]

  static resetData (size = 4) {
    // NOTE: create square matrix
    return Array.from({length: size}, () => Array.from({length: size}, () => Math.random() > 0.8 ? 2 : null)) // initialize grid with 2's or null
  }

  static attributes = {
    size: 'size'
  }

  static styles () {
    return `
      <style>
      .board-content {
        display: grid;
        grid-template-columns: repeat(4, minmax(100px, 1fr));
        grid-auto-rows: minmax(100px, auto);
      }
      
      .cell {
        display: grid;
        align-items: center;
        justify-items: center;
        border: 1px solid #000;
      }

      .cell[value="2"] {
        background-color: rgb(240, 240, 240);
      }
      .cell[value="4"] {
        background-color: beige;
      }
      .cell[value="8"] {
        background-color: yellow;
      }
      .cell[value="16"] {
        background-color: rgb(215, 185, 110);
      }
      .cell[value="32"] {
        background-color: orange;
      }
      .cell[value="64"] {
        background-color: rgb(255, 125, 33);
      }
      .cell[value="128"] {
        background-color: rgb(26, 215, 221);
      }
      .cell[value="256"] {
        background-color: rgb(0, 255, 166);
      }
      .cell[value="512"] {
        background-color: rgb(17, 189, 40);
      }
      .cell[value="1024"] {
        background-color: rgb(20, 129, 7);
      }
      .cell[value="2048"] {
        background-color: rgb(252, 0, 0);
      }
      </style>
    `;
  }

  static template ({ size }) {
    return `
      <section class="${ Board.className }-content js-${ Board.className }-content">
        ${
          Array.from({ length: size*size}).map(e => `<${Cell.tagName} class="${Cell.classList.join(" ")}" value=""></${Cell.tagName}>`).join('')
        }
      </section>
    `;
  }

  // TODO: add attributeChangedCallback && observedAttributes for 'size'

  connectedCallback () {
    this.element = this.shadowRoot.querySelector(Board.selector);
    this._addListeners();
    this.render();
  }
  
  // PRIVATE METHODS

  _addListeners () {
    this._onSwipe = this._onSwipe.bind(this);
    this._onReset = this._onReset.bind(this);

    this.addEventListener(EVENTS.SWIPE, this._onSwipe);
    this.addEventListener(EVENTS.RESET, this._onReset);
  }

  _onSwipe (evt) {
    evt.preventDefault();
    const { direction } = evt.detail;
    this.swipe(direction);
  }

  _onReset (evt) {
    evt.preventDefault();
    this.reset();
  }

  _introduce () {
    // take the existing data and add a new 2 or 4 to an available slot
    const newNum = Math.random() > 0.4 ? 2 : 4; // trend towards 2s
    const availableSpaces = this._assessAvailable();
    const idx = Math.round(Math.random() * availableSpaces.length) % availableSpaces.length; // random int based on # of available spaces
    const [x,y] = availableSpaces[idx]; // get matrix coordinates of available space chosen at random
    this._state[x][y] = newNum;
  }

  _assessAvailable () {
    const availableSpaces = [];
    
    for (let i = 0; i < this._state.length; i++) {
      for (let j = 0; j < this._state.length; j++) {
        if (this._state[i][j] === Cell.emptyValues.value) availableSpaces.push([i,j]);
      }
    }

    return availableSpaces;
  }

  _rebuild () {
    this._deleteGrid();
    this.reset();
  }

  _deleteGrid () {
    if (this.element.children.length) Array.from(this.element.children).forEach(el => el.remove());
  }

  // _makeGrid () {
  //   this._deleteGrid();
  //   const cells = this.state.flat().map(val => new Cell(val))
  //   this.element.append(...cells.map(p => p.element));
  //   this._cells = cells;
  // }
  
  
  /* NOTE: previous, naive implementation (does not work for instance such as [2,0,2,0])
    for (let i = 0; i < row.length; i++) {
      if (!row[i]) continue; // if it's 0, skip
      if (row[i] == row[i+1]) {
        out.push(row[i] + row[i+1]);
        i++;
      }
      else {
        out.push(row[i]);
      }
    }
  */
  _mergeRow (row) {
    const out = [];
    let l = 0, r = 1; // 2 pointers

    /* NOTE: O(n) I believe, single-pass consolidation
      increment r and compare to l
      we don't care about nulls, so while r == null, increment
      if l === r
        push sum to output
        move l to right of r
        move r+1
      else (l !== r)
        if l !== null && !undefined (i.e. !out of bounds)
          push l to output
          increment l
        (because we don't care about 0s) while l == null, increment
        increment r
    */  
    while (l < row.length) {
      while (row[r] === Cell.emptyValues.value) r++;
      if (row[l] === row[r]) {
        out.push(row[l] + row[r]);
        l = ++r;
        r++;
      } else {
        if (row[l] !== Cell.emptyValues.value) {
          out.push(row[l]); // we know there's no neighbor match, push val to output
          l++;
        }
        while (row[l] === Cell.emptyValues.value) l++; // we don't care about nulls
        r++;
      }
    }

    while (out.length < row.length) out.push(Cell.emptyValues.value);
    
    return out;
  }

  _mergeRows (grid) {
    return grid.map(this._mergeRow);
  }

  _compareStates (prev, curr) {
    for (let i = 0; i < Math.max(prev.length, curr.length); i++) {
      for (let j = 0; j < Math.max(prev.length, curr.length); j++) {
        if (prev[i][j] !== curr[i][j]) return true;
      }
    }

    return false;
  }

  _calculateSwipeLeft () {
    const merged = this._mergeRows(this._state);
    return merged;
  }

  _calculateSwipeRight () {
    const merged = this._mergeRows(reverseMatrix(this._state));
    return reverseMatrix(merged);
  }

  _calculateSwipeUp () {
    const rotated = rotateMatrixCounterClockwise(this._state)
    const merged = this._mergeRows(rotated);
    return rotateMatrixClockwise(merged);
  }

  _calculateSwipeDown () {
    const rotated = rotateMatrixClockwise(this._state);
    const merged = this._mergeRows(rotated);
    return rotateMatrixCounterClockwise(merged);
  }

  _calculateStateFromSwipe (direction) {
    // call swipe direction
    let updatedState;
    switch (direction) {
      case 'up':
        updatedState = this._calculateSwipeUp();
        break;
      case 'left':
        updatedState = this._calculateSwipeLeft();
        break;
      case 'down':
        updatedState = this._calculateSwipeDown();
        break;
      case 'right':
        updatedState = this._calculateSwipeRight();
        break;
      default:
        throw new Error(`Invalid Action: ${ direction }`);
    }

    return updatedState;
  }

  // PUBLIC METHODS
  reset () {
    this._state = this.constructor.resetData();
    this.render();
  }

  swipe (direction) {
    if (!direction) throw new Error(`No/Invalid swipe direction provided: ${ direction }`);
    // capture current data
    const prevState = this._state;
    // get new state
    const newState = this._calculateStateFromSwipe(direction)
    this.state = newState; // TODO: move to updateState()?
    // compare prev to current
    const shouldIntroduce = this._compareStates(prevState, newState);
    // if different, introduce
    if (shouldIntroduce) this._introduce();
    // assess win/lose status
    this.render();
  }

  // TODO: consider making this a private method
  render () {
    for (let i = 0; i < this.state.length; i++) {
      for (let j = 0; j < this.state.length; j++) {
        const idx = (this.state.length * i) + j; // number 0-15
        const cell = this._cells[idx];
        cell.setAttribute(Cell.attributes.value, this.state[i][j]);
      }
    }
  }
}