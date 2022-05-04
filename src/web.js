import App from './components/App';
import Board from './components/Board';
import Cell from './components/Cell';
import CustomModal from './components/CustomModal';

window.customElements.define(App.tagName, App);
window.customElements.define(Board.tagName, Board, { is: 'article' });
window.customElements.define(Cell.tagName, Cell);
window.customElements.define(CustomModal.tagName, CustomModal, { is: 'aside' });