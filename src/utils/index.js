const compose = (a, b) => x => a(b(x));
const reverse = array => [...array].reverse();
const flipMatrix = matrix => (
  matrix[0].map((column, index) => (
    matrix.map(row => row[index])
  ))
);
export const rotateMatrixClockwise = compose(flipMatrix, reverse);
export const rotateMatrixCounterClockwise = compose(reverse, flipMatrix);
export const reverseMatrix = (matrix) => matrix.map(row => row.reverse());