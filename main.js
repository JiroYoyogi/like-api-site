const apiUrl ="";

const count = document.getElementById('js-count');
const like = document.getElementById('js-like');

like.addEventListener('click', () => {
  // count要素の中身（数字）を取得
  const currentString = count.innerText;
  // デフォルトだとテキスト型の数字になってしまうので数値型に変更
  const currentNumber = Number(currentString);
  count.innerText = currentNumber + 1;
  // count.innerText = currentString + 1;

});