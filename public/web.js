var lib = (() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/components/Dynamic.js
  var DynamicComponent = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const shadow = this.shadowRoot;
      const styles2 = this.constructor.styles();
      const stylesTemplate = this.constructor.makeTemplateElement(styles2);
      const cloneStyles = stylesTemplate.content.cloneNode(true);
      const attrs = Object.entries(this.constructor.attributes).reduce((acc, [key, val]) => ({ ...acc, [key]: this.getAttribute(val) }), {});
      const rendered = this.constructor.template(attrs);
      const template = this.constructor.makeTemplateElement(rendered);
      const cloneChild = template.content.cloneNode(true);
      shadow.append(cloneStyles, cloneChild);
    }
    static makeTemplateElement(tmpl) {
      const template = document.createElement("template");
      template.innerHTML = tmpl;
      return template;
    }
    static makeEvent(name, data) {
      return new CustomEvent(name, { bubbles: true, ...data });
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
      this.contentEl = this.shadowRoot.querySelector("span");
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

  // src/utils/index.js
  var compose = (a, b) => (x) => a(b(x));
  var reverse = (array) => [...array].reverse();
  var flipMatrix = (matrix) => matrix[0].map((column, index) => matrix.map((row) => row[index]));
  var rotateMatrixClockwise = compose(flipMatrix, reverse);
  var rotateMatrixCounterClockwise = compose(reverse, flipMatrix);
  var reverseMatrix = (matrix) => matrix.map((row) => row.reverse());

  // src/components/Board.js
  var EVENTS = {
    SWIPE: "swipe",
    RESET: "reset"
  };
  var _Board = class extends DynamicComponent {
    constructor() {
      super();
      this._state = this.constructor.resetData();
      this._cells = Array.from(this.shadowRoot.querySelectorAll(Cell.tagName));
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
      this.element = this.shadowRoot.querySelector(_Board.selector);
      this._addListeners();
      this.render();
    }
    _addListeners() {
      this._onSwipe = this._onSwipe.bind(this);
      this._onReset = this._onReset.bind(this);
      this.addEventListener(EVENTS.SWIPE, this._onSwipe);
      this.addEventListener(EVENTS.RESET, this._onReset);
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
    _introduce() {
      const newNum = Math.random() > 0.4 ? 2 : 4;
      const availableSpaces = this._assessAvailable();
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

  // src/components/App.js
  var App = class extends DynamicComponent {
    constructor() {
      super();
      this.boardEl = this.shadowRoot.querySelector(Board.tagName);
      this.swipeBtnEls = Array.from(this.shadowRoot.querySelectorAll(".js-swipe-btn"));
      this.resetEls = Array.from(this.shadowRoot.querySelectorAll(".js-reset-btn"));
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

        .swipe {
          position: relative;
          width: 80px;
          height: 40px;
        }
    
        .swipe::after {
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

        .swipe-l {
          transform: rotate(-90deg);
        }
        .swipe-r {
          transform: rotate(90deg);
        }
        .swipe-d {
          transform: rotate(180deg);
        }
      </style>
    `;
    }
    static template({ size }) {
      return `
      <div class="top-l"></div>
      <div class="top-m">
        <button type="button" class="btn swipe swipe-u js-swipe-btn" id="swipe-up" value="up"></button>
      </div>
      <div class="top-r"></div>
      <div class="mid-l">
        <button type="button" class="btn swipe swipe-l js-swipe-btn" id="swipe-left" value="left"></button>
      </div>
      <div class="mid-m js-board-container">
        <game-board class="${Board.classList.join(" ")}" size="${size}"></game-board>
      </div>
      <div class="mid-r">
        <button type="button" class="btn swipe swipe-r js-swipe-btn" id="swipe-right" value="right"></button>
      </div>
      <div class="bot-l"></div>
      <div class="bot-m">
        <button type="button" class="btn swipe swipe-d js-swipe-btn" id="swipe-down" value="down"></button>
      </div>
      <div class="bot-r"></div>
      <custom-modal heading="You fucking lost, idiot." description="Maybe don't suck so much? \xAF(\u30C4)/\xAF" class="js-modal-lost">
        <!-- TODO: implement other options for lose state -->
        <button type="button" id="reset" class="btn reset js-reset-btn">Start Over</button>
      </custom-modal>
    `;
    }
    connectedCallback() {
      this._addListeners();
    }
    _addListeners() {
      const handleSwipe = this.swipe.bind(this);
      const handleReset = this.reset.bind(this);
      this.swipeBtnEls.forEach((el) => el.addEventListener("click", handleSwipe));
      this.resetEls.forEach((el) => el.addEventListener("click", handleReset));
    }
    swipe(evt) {
      evt.preventDefault();
      const direction = evt.currentTarget.value;
      const swipeEvt = this.constructor.makeEvent(EVENTS.SWIPE, { detail: { direction } });
      this.boardEl.dispatchEvent(swipeEvt);
    }
    reset(evt) {
      evt.preventDefault();
      const resetEvt = this.constructor.makeEvent(EVENTS.RESET);
      this.boardEl.dispatchEvent(resetEvt);
    }
  };
  __publicField(App, "defaultSize", 4);
  __publicField(App, "attributes", {
    size: "size"
  });

  // src/components/CustomModal.js
  var CLASS_NAME = "modal";
  var CSS_TRANSITION_LENGTH = "300ms";
  var CSS_TRANSLATE_DISTANCE = "200px";
  var CSS_HIDE_CLASS = "hidden";
  var EVENTS2 = {
    MAIN: CLASS_NAME,
    OPEN: "open",
    CLOSE: "close",
    TOGGLE: "toggle"
  };
  var elementTmpl = document.createElement("template");
  var styles = document.createElement("style");
  styles.innerHTML = `
  .${CLASS_NAME} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    
    display: flex;
    align-items: center;

    transition: opacity ${CSS_TRANSITION_LENGTH};
  }

  .${CLASS_NAME}-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
  }

  .${CLASS_NAME}-content {
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
    transition: transform ${CSS_TRANSITION_LENGTH} ease-out;
  }

  .${CSS_HIDE_CLASS}.${CLASS_NAME} {
    opacity: 0;
    z-index: -1;
  }

  .${CSS_HIDE_CLASS} .${CLASS_NAME}-content {
    transform: translate3d(0, ${CSS_TRANSLATE_DISTANCE}, 0);
  }
`;
  elementTmpl.innerHTML = `
<aside class="${CLASS_NAME} ${CSS_HIDE_CLASS} js-${CLASS_NAME}" id="${CLASS_NAME}" role="dialog" aria-labelledby="dialog">
  <div class="${CLASS_NAME}-bg"></div>
  <article class="${CLASS_NAME}-content">
    <h4 class="js-${CLASS_NAME}-heading"><slot name="heading"></slot></h4>
    <p class="js-${CLASS_NAME}-description"><slot name="description"></slot></p>
    <section class="${CLASS_NAME}-options">
      <slot></slot>
    </section>
  </article>
</aside>
`;
  var _CustomModal = class extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(styles);
      shadow.appendChild(elementTmpl.content.cloneNode(true));
    }
    connectedCallback() {
      this.element = this.shadowRoot.querySelector(`${_CustomModal.selector}`);
      this.addListeners();
      this.render();
    }
    addListeners() {
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.addEventListener(EVENTS2.MAIN, (evt) => {
        evt.preventDefault();
        const { message } = evt.detail;
        switch (message) {
          case "OPEN":
            this.open();
            break;
          case "CLOSE":
            this.close();
            break;
          default:
            console.error(`Invalid modal message: ${message}`);
            break;
        }
      });
    }
    render() {
      this.shadowRoot.querySelector(`${_CustomModal.selector}-heading`).innerText = this.getAttribute("heading");
      this.shadowRoot.querySelector(`${_CustomModal.selector}-description`).innerText = this.getAttribute("desctiption");
    }
    open() {
      this.element.classList.remove(CSS_HIDE_CLASS);
    }
    close() {
      this.element.classList.add(CSS_HIDE_CLASS);
    }
  };
  var CustomModal = _CustomModal;
  __publicField(CustomModal, "selector", `.js-${CLASS_NAME}`);

  // src/web.js
  window.customElements.define("game-app", App);
  window.customElements.define("game-board", Board, { is: "article" });
  window.customElements.define("game-cell", Cell);
  window.customElements.define("custom-modal", CustomModal);
})();
