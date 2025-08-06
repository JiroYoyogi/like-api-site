const apiUrl =
  "https://jcdjm3eydj.execute-api.ap-northeast-1.amazonaws.com/likes";

const count = document.getElementById('js-count');
const like = document.getElementById('js-like');

like.addEventListener('click', () => {
  // 数値をカウントアップ
  let current = count.innerText;
  current = Number(current);
  count.innerText = current + 1;

  // カウントがあるならば isLikedクラス を付与
  if (!like.classList.contains('isLiked')) {
    like.classList.add('isLiked');
  }

  // APIにPOST
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Hello!",
    }),
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

});