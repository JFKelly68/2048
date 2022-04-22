import App from "./components/App";
import Board from "./components/Board";
import Cell from "./components/Cell";
import CustomModal from './components/CustomModal';

window.customElements.define('game-app', App);
window.customElements.define('game-board', Board, { is: 'article' });
window.customElements.define('game-cell', Cell);
window.customElements.define('custom-modal', CustomModal);