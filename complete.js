const apiUrl = "";

const count = document.getElementById('js-count');
const like = document.getElementById('js-like');

// いいねを取得
fetch(apiUrl, { method: "GET" })
.then((res) => res.json())
.then((responseBody) => {
  console.log(responseBody);
  const likes = responseBody;
  count.innerText = likes.length;
  if (responseBody.length) {
    like.classList.add('isLiked');
  }
})
.catch((err) => {
  console.log(err);
});

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
  fetch(apiUrl,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: "YOUR.NAME",
    }),
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

});