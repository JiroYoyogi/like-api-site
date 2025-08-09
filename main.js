const apiUrl ="";

const count = document.getElementById('js-count');
const like = document.getElementById('js-like');

like.addEventListener('click', () => {
  // 数値をカウントアップ
  const currentString = count.innerText;
  const currentNumber = Number(currentString);
  count.innerText = currentNumber + 1;
  // count.innerText = currentString + 1;

});