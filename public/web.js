var lib = (() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/utils/index.js
  var compose = (a, b) => (x) => a(b(x));
  var reverse = (array) => [...array].reverse();
  var flipMatrix = (matrix) => matrix[0].map((column, index) => matrix.map((row) => row[index]));
  var rotateMatrixClockwise = compose(flipMatrix, reverse);
  var rotateMatrixCounterClockwise = compose(reverse, flipMatrix);
  var reverseMatrix = (matrix) => matrix.map((row) => row.reverse());

  // src/components/DynamicComponent.js
  var DynamicComponent = class extends HTMLElement {
    constructor() {
      super();
      const styles = this.constructor.styles();
      const attrs = Object.entries(this.constructor.attributes).reduce((acc, [key, val]) => ({ ...acc, [key]: this.getAttribute(val) }), {});
      const rendered = this.constructor.template(attrs);
      this.innerHTML = `${styles}${rendered}`;
    }
    static makeTemplateElement(tmpl) {
      if (!tmpl)
        throw new Error("No template argument provided");
      const template = document.createElement("template");
      template.innerHTML = tmpl;
      return template;
    }
    static makeEvent(name, data) {
      return new CustomEvent(name, { bubbles: true, ...data });
    }
    static get tagName() {
      throw new Error(`${this.constructor.name} class must overwrite the static get method "tagName"`);
    }
    static styles() {
      return `<style></style>`;
    }
    static template() {
      throw new Error(`${this.constructor.name} class must override static method "template"`);
    }
    static get attributes() {
      throw new Error(`${this.constructor.name} class must override static get method "attributes"`);
    }
  };

  // src/components/Cell.js
  var _Cell = class extends DynamicComponent {
    constructor() {
      super();
      this.contentEl = this.querySelector("span");
    }
    static get className() {
      return "cell";
    }
    static template({ value }) {
      return `<span>${JSON.parse(value) === _Cell.emptyValues.value ? `${_Cell.emptyValues.display}` : `${value}`}</span>`;
    }
    attributeChangedCallback(name, old, fresh) {
      if (name === _Cell.attributes.value)
        this.render(JSON.parse(fresh));
    }
    connectedCallback() {
    }
    render(val) {
      this.contentEl.innerText = val || this.constructor.emptyValues.display;
    }
  };
  var Cell = _Cell;
  __publicField(Cell, "tagName", "game-cell");
  __publicField(Cell, "selector", `js-${_Cell.className}`);
  __publicField(Cell, "classList", [
    `${_Cell.className}`,
    `${_Cell.selector}`
  ]);
  __publicField(Cell, "emptyValues", {
    display: "",
    attribute: "empty",
    value: null
  });
  __publicField(Cell, "attributes", {
    value: "value"
  });
  __publicField(Cell, "observedAttributes", Object.values(_Cell.attributes));

  // src/components/Board.js
  var EVENTS2 = {
    SWIPE: "swipe",
    RESET: "reset",
    LOSE: "lose"
  };
  var _Board = class extends DynamicComponent {
    constructor() {
      super();
      this._state = this.constructor.resetData();
      this._cells = Array.from(this.querySelectorAll(Cell.tagName));
      this.element = null;
    }
    get state() {
      return this._state;
    }
    set state(newState) {
      this._state = newState;
    }
    static get className() {
      return "board";
    }
    static get selector() {
      return `js-${this.className}`;
    }
    static resetData(size = 4) {
      return Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random() > 0.8 ? 2 : null));
    }
    static styles() {
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
    static template({ size }) {
      return `
      <section class="${_Board.className}-content js-${_Board.className}-content">
        ${Array.from({ length: size * size }).map((e) => `<${Cell.tagName} class="${Cell.classList.join(" ")}" value=""></${Cell.tagName}>`).join("")}
      </section>
    `;
    }
    connectedCallback() {
      this.element = this.querySelector(_Board.selector);
      this._addListeners();
      this.render();
    }
    _addListeners() {
      this._onSwipe = this._onSwipe.bind(this);
      this._onReset = this._onReset.bind(this);
      this._onEnd = this._onEnd.bind(this);
      this.addEventListener(EVENTS2.SWIPE, this._onSwipe);
      this.addEventListener(EVENTS2.RESET, this._onReset);
      this.addEventListener(EVENTS.END, this._onEnd);
    }
    _onSwipe(evt) {
      evt.preventDefault();
      const { direction } = evt.detail;
      this.swipe(direction);
    }
    _onReset(evt) {
      evt.preventDefault();
      this.reset();
    }
    _onEnd(evt) {
      evt.preventDefault();
      this.lose();
    }
    _introduce() {
      const newNum = Math.random() > 0.4 ? 2 : 4;
      const availableSpaces = this._assessAvailable();
      if (!availableSpaces.length)
        return;
      const idx = Math.round(Math.random() * availableSpaces.length) % availableSpaces.length;
      const [x, y] = availableSpaces[idx];
      this._state[x][y] = newNum;
    }
    _assessAvailable() {
      const availableSpaces = [];
      for (let i = 0; i < this._state.length; i++) {
        for (let j = 0; j < this._state.length; j++) {
          if (this._state[i][j] === Cell.emptyValues.value)
            availableSpaces.push([i, j]);
        }
      }
      return availableSpaces;
    }
    _rebuild() {
      this._deleteGrid();
      this.reset();
    }
    _deleteGrid() {
      if (this.element.children.length)
        Array.from(this.element.children).forEach((el) => el.remove());
    }
    _mergeRow(row) {
      const out = [];
      let l = 0, r = 1;
      while (l < row.length) {
        while (row[r] === Cell.emptyValues.value)
          r++;
        if (row[l] === row[r]) {
          out.push(row[l] + row[r]);
          l = ++r;
          r++;
        } else {
          if (row[l] !== Cell.emptyValues.value) {
            out.push(row[l]);
            l++;
          }
          while (row[l] === Cell.emptyValues.value)
            l++;
          r++;
        }
      }
      while (out.length < row.length)
        out.push(Cell.emptyValues.value);
      return out;
    }
    _mergeRows(grid) {
      return grid.map(this._mergeRow);
    }
    _compareStates(prev, curr) {
      for (let i = 0; i < Math.max(prev.length, curr.length); i++) {
        for (let j = 0; j < Math.max(prev.length, curr.length); j++) {
          if (prev[i][j] !== curr[i][j])
            return true;
        }
      }
      return false;
    }
    _calculateSwipeLeft() {
      const merged = this._mergeRows(this._state);
      return merged;
    }
    _calculateSwipeRight() {
      const merged = this._mergeRows(reverseMatrix(this._state));
      return reverseMatrix(merged);
    }
    _calculateSwipeUp() {
      const rotated = rotateMatrixCounterClockwise(this._state);
      const merged = this._mergeRows(rotated);
      return rotateMatrixClockwise(merged);
    }
    _calculateSwipeDown() {
      const rotated = rotateMatrixClockwise(this._state);
      const merged = this._mergeRows(rotated);
      return rotateMatrixCounterClockwise(merged);
    }
    _calculateStateFromSwipe(direction) {
      let updatedState;
      switch (direction) {
        case "up":
          updatedState = this._calculateSwipeUp();
          break;
        case "left":
          updatedState = this._calculateSwipeLeft();
          break;
        case "down":
          updatedState = this._calculateSwipeDown();
          break;
        case "right":
          updatedState = this._calculateSwipeRight();
          break;
        default:
          throw new Error(`Invalid Action: ${direction}`);
      }
      return updatedState;
    }
    reset() {
      this._state = this.constructor.resetData();
      this.render();
    }
    lose() {
      const loseEvt = this.constructor.makeEvent(EVENTS2.LOSE);
      this.dispatchEvent(loseEvt);
    }
    swipe(direction) {
      if (!direction)
        throw new Error(`No/Invalid swipe direction provided: ${direction}`);
      const prevState = this._state;
      const newState = this._calculateStateFromSwipe(direction);
      this.state = newState;
      const shouldIntroduce = this._compareStates(prevState, newState);
      if (shouldIntroduce)
        this._introduce();
      this.render();
    }
    render() {
      for (let i = 0; i < this.state.length; i++) {
        for (let j = 0; j < this.state.length; j++) {
          const idx = this.state.length * i + j;
          const cell = this._cells[idx];
          cell.setAttribute(Cell.attributes.value, this.state[i][j]);
        }
      }
    }
  };
  var Board = _Board;
  __publicField(Board, "tagName", "game-board");
  __publicField(Board, "classList", [
    _Board.className,
    _Board.selector
  ]);
  __publicField(Board, "attributes", {
    size: "size"
  });

  // src/components/CustomModal.js
  var STYLES2 = {
    TRANSITION_LENGTH: "300ms",
    TRANSLATE_DISTANCE: "200px"
  };
  var EVENTS3 = {
    TOGGLE: "toggle",
    OPEN: "open",
    CLOSE: "close"
  };
  var _CustomModal = class extends DynamicComponent {
    constructor() {
      super();
    }
    static styles() {
      return `
      <style>
        .${_CustomModal.className} {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 1;
          
          display: flex;
          align-items: center;
      
          transition: opacity ${STYLES2.TRANSITION_LENGTH};
        }
      
        .${_CustomModal.className}-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: rgba(0,0,0,0.3);
        }
      
        .${_CustomModal.className}-content {
          margin: 0 auto;
          width: 60%;
          min-width: 300px;
          background-color: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
      
          transform: translate3d(0, 0, 0);
          transition: transform ${STYLES2.TRANSITION_LENGTH} ease-out;
        }
      </style>
    `;
    }
    static template({ heading, description }) {
      return `
      <div class="${_CustomModal.className}-bg"></div>
      <article class="${_CustomModal.className}-content">
        <h4 class="js-${_CustomModal.className}-heading"><slot name="heading">${heading}</slot></h4>
        <p class="js-${_CustomModal.className}-description"><slot name="description">${description}</slot></p>
        <section class="${_CustomModal.className}-options">
          <slot>Default slot content</slot>
        </section>
      </article>
    `;
    }
    attributeChangedCallback(name, old, fresh) {
      switch (name) {
        case _CustomModal.attributes.heading:
        case _CustomModal.attributes.description:
          this.render({ [name]: fresh });
          break;
        default:
          throw new Error(`Unknown attribute: ${name} updated`);
      }
    }
    connectedCallback() {
      this.addListeners();
    }
    addListeners() {
      this._onToggle = this._onToggle.bind(this);
      this.addEventListener(EVENTS3.TOGGLE, this._onToggle);
    }
    render({ heading, description }) {
      if (heading)
        this.querySelector(`.${_CustomModal.selector}-heading`).innerText = heading;
      if (description)
        this.querySelector(`.${_CustomModal.selector}-description`).innerText = description;
    }
    _onToggle(evt) {
      evt.stopPropagation();
      const { message } = evt.detail;
      switch (message) {
        case EVENTS3.OPEN:
          this.open();
          break;
        case EVENTS3.CLOSE:
          this.close();
          break;
        default:
          console.error(`Invalid modal message: ${message}`);
          break;
      }
    }
    open() {
      this.classList.remove(STYLES.HIDE_CLASS);
    }
    close() {
      this.classList.add(STYLES.HIDE_CLASS);
    }
  };
  var CustomModal = _CustomModal;
  __publicField(CustomModal, "tagName", "custom-modal");
  __publicField(CustomModal, "className", "modal");
  __publicField(CustomModal, "selector", `js-${_CustomModal.className}`);
  __publicField(CustomModal, "attributes", {
    heading: "heading",
    description: "description"
  });
  __publicField(CustomModal, "htmlAttributes", {
    role: "dialog",
    "aria-labelledby": "dialog"
  });
  __publicField(CustomModal, "classList", [
    _CustomModal.className,
    `js-${_CustomModal.className}`
  ]);
  __publicField(CustomModal, "observedAttributes", Object.values(_CustomModal.attributes));

  // src/components/App.js
  var STYLES = {
    HIDE_CLASS: "hidden"
  };
  var EVENTS = {
    RESET: "reset",
    END: "end"
  };
  var _App = class extends DynamicComponent {
    constructor() {
      super();
      this.boardEl = this.querySelector(Board.tagName);
      this.modalEl = this.querySelector(CustomModal.tagName);
      this.swipeBtnEls = Array.from(this.querySelectorAll(`.js-${_App.actions.swipe}-btn`));
      this.resetEls = Array.from(this.querySelectorAll(`.js-${_App.actions.reset}-btn`));
      this.endEl = this.querySelector(`.js-${_App.actions.end}-btn`);
    }
    static styles() {
      return `
      <style>
        .top-m,
        .mid-l,
        .mid-r,
        .bot-m {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .${_App.actions.swipe} {
          position: relative;
          width: 80px;
          height: 40px;
        }
    
        .${_App.actions.swipe}::after {
          content: '^';
          display: flex;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          transform-origin: center;
        }

        .${_App.actions.swipe}-l {
          transform: rotate(-90deg);
        }
        .${_App.actions.swipe}-r {
          transform: rotate(90deg);
        }
        .${_App.actions.swipe}-d {
          transform: rotate(180deg);
        }

        .${STYLES.HIDE_CLASS}.${CustomModal.className} {
          opacity: 0;
          z-index: -1;
        }
      
        .${STYLES.HIDE_CLASS} .${CustomModal.className}-content {
          transform: translate3d(0, ${STYLES2.TRANSLATE_DISTANCE}, 0);
        }
      </style>
    `;
    }
    static template({ size }) {
      return `
      <section class="grid-3x3">
      <div class="top-l"></div>
      <div class="top-m">
        <button type="button" class="btn ${_App.actions.swipe} ${_App.actions.swipe}-u js-${_App.actions.swipe}-btn" id="${_App.actions.swipe}-up" value="up"></button>
      </div>
      <div class="top-r"></div>
      <div class="mid-l">
        <button type="button" class="btn ${_App.actions.swipe} ${_App.actions.swipe}-l js-${_App.actions.swipe}-btn" id="${_App.actions.swipe}-left" value="left"></button>
      </div>
      <div class="mid-m js-board-container">
        <${Board.tagName} class="${Board.classList.join(" ")}" size="${size}"></${Board.tagName}>
      </div>
      <div class="mid-r">
        <button type="button" class="btn ${_App.actions.swipe} ${_App.actions.swipe}-r js-${_App.actions.swipe}-btn" id="${_App.actions.swipe}-right" value="right"></button>
      </div>
      <div class="bot-l"></div>
      <div class="bot-m">
        <button type="button" class="btn ${_App.actions.swipe} ${_App.actions.swipe}-d js-${_App.actions.swipe}-btn" id="${_App.actions.swipe}-down" value="down"></button>
      </div>
      <div class="bot-r"></div>
      </section>
      <footer>
        <button type="button" id="${_App.actions.reset}" class="btn ${_App.actions.reset} js-${_App.actions.reset}-btn">Reset</button>
        <button type="button" id="${_App.actions.end}" class="btn ${_App.actions.end} js-${_App.actions.end}-btn">End</button>
      </footer>
      <${CustomModal.tagName} class="${CustomModal.classList.join(" ")} ${STYLES.HIDE_CLASS}"
        ${Object.entries(CustomModal.htmlAttributes).reduce((acc, [attr, value]) => `${acc} ${attr}="${value}"`, "")}
        heading="You fucking lost, idiot." 
        description="Maybe don't suck so much? \xAF\\(\u30C4)/\xAF"
      >
        <button type="button" id="${_App.actions.reset}" class="btn ${_App.actions.reset} js-${_App.actions.reset}-btn">Start Over</button>
      </${CustomModal.tagName}>
    `;
    }
    connectedCallback() {
      this._addListeners();
    }
    _addListeners() {
      this._onSwipe = this._onSwipe.bind(this);
      this._onReset = this._onReset.bind(this);
      this._onLose = this._onLose.bind(this);
      this._onEnd = this._onEnd.bind(this);
      this.swipeBtnEls.forEach((el) => el.addEventListener("click", this._onSwipe));
      this.resetEls.forEach((el) => el.addEventListener("click", this._onReset));
      this.endEl.addEventListener("click", this._onEnd);
      this.addEventListener(EVENTS2.LOSE, this._onLose);
    }
    _onEnd(evt) {
      evt.stopPropagation();
      const endEvt = this.constructor.makeEvent(EVENTS.END);
      this.boardEl.dispatchEvent(endEvt);
    }
    _onLose(evt) {
      evt.stopPropagation();
      const openModalEvt = this.constructor.makeEvent(EVENTS3.TOGGLE, { detail: { message: EVENTS3.OPEN } });
      this.modalEl.dispatchEvent(openModalEvt);
    }
    _onSwipe(evt) {
      evt.preventDefault();
      const direction = evt.currentTarget.value;
      const swipeEvt = this.constructor.makeEvent(EVENTS2.SWIPE, { detail: { direction } });
      this.boardEl.dispatchEvent(swipeEvt);
    }
    _onReset(evt) {
      evt.preventDefault();
      const resetEvt = this.constructor.makeEvent(EVENTS2.RESET);
      this.boardEl.dispatchEvent(resetEvt);
    }
  };
  var App = _App;
  __publicField(App, "tagName", "game-app");
  __publicField(App, "defaultSize", 4);
  __publicField(App, "attributes", {
    size: "size"
  });
  __publicField(App, "actions", {
    swipe: "swipe",
    reset: "reset",
    end: "end"
  });

  // src/web.js
  window.customElements.define(App.tagName, App);
  window.customElements.define(Board.tagName, Board, { is: "article" });
  window.customElements.define(Cell.tagName, Cell);
  window.customElements.define(CustomModal.tagName, CustomModal, { is: "aside" });
})();
