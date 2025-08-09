# サイトをDL

右上の緑の「Code」→「Download ZIP」

# カウントがあれば色が変わる （クライアント）

```js
  // カウントがあるならば isLikedクラス を付与
  if (!like.classList.contains('isLiked')) {
    like.classList.add('isLiked');
  }
```

# DynamoDBテーブルを作成

- テーブル名：`likes`
- パーティションキー：`id`

# Node.jsとは？

JavaScriptと同じ文法で書けるサーバーサイドプログラミング言語

# いいね送信（サーバーサイド・Node.js）

- 名前：`likes-post`
- ランタイム：Node.js 22.x
- アーキテクチャ：x86_64

```js
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto"; // UUIDを作るライブラリ。重複しないIDを作りたい

const client = new DynamoDBClient();

export const handler = async (event) => {
  console.log(event);
  // UUIDを作成
  const id = randomUUID();
  const d = new Date();
  // UNIXタイムスタンプ（ミリ秒）
  const timestamp = d.getTime();
  // ”いいね”された時間を日本時間で保存したい
  const jstTime = d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour12: false,
  });

  const input = {
    TableName: "likes",
    Item: {
      id: {
        // S は id が文字列（string）であると言う意味
        S: id,
      },
      createdAt: {
        // N は timestamp が数値（number）であると言う意味
        // 本当は、数値のまま使いたいが、文字列に変換してDBに保存しないといけない仕様...
        N: String(timestamp)
      },
      createdAtJST: {
        S: jstTime
      },
      user: {
        S: "test"
      }
    }
  };

  try {
    const command = new PutItemCommand(input);
    await client.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify({
        message: "success"
      })
    }
  } catch( error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify({
        message: error.message
      }),
    }
  }
}
```

## いいね取得（サーバーサイド・Node.js）

- 名前：`likes-get`
- ランタイム：Node.js 22.x
- アーキテクチャ：x86_64

```js
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

export const handler = async () => {
  const input = {
    TableName: "likes"
  };

  try {
    const command = new ScanCommand(input);
    const response = await client.send(command);
    console.log(response);

    const items = response.Items.map(item => ({
      id: item.id.S,
      createdAt: Number(item.createdAt.N),
      createdAtJST: item.createdAtJST.S,
      user: item.user.S
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(items)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};
```

# API作成

## API

- API名：`likes-http-api`

## ルールの作成

### いいね保存

【ルートとメソッド】

- POST
- likes

【統合ターゲット】

- Lambda関数

### いいね取得

【ルートとメソッド】

- GET
- likes

【統合ターゲット】

- Lambda関数

## クロスオリジンリソース共有

- Access-Control-Allow-Origin
  - 「*」と入力して追加
- Access-Control-Allow-Methods
  - 「*」を選択

# いいね取得・保存（クライアント）

- いいねを保存

```js
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
```

- いいねを取得

```js
// いいねを取得
fetch(apiUrl, { method: "GET" })
.then((res) => res.json())
.then((responseBody) => {
  count.innerText = responseBody.length;
  if (responseBody.length) {
    like.classList.add('isLiked');
  }
})
.catch((err) => {
  console.log(err);
});
```