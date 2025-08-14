# 手順

- サイトをDL
- サイトの内容を確認・変更（クライアント）
- DynamoDBテーブルを作成（サーバーサイド）
- Lambdaを作成（サーバーサイド）
- API Gatewayを作成（サーバーサイド）
- いいねを取得保存（クライアント）

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

# Lambda作成

## Node.jsとは？

JavaScriptと同じ文法で書けるサーバーサイドプログラミング言語

## いいね取得（サーバーサイド・Node.js）

- 名前：`likes-get`
- ランタイム：Node.js 22.x
- アーキテクチャ：x86_64

```js
// DynamoDBを操作するライブラリの読み込み
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

// APIにアクセスがあるとhandlerと言う名前の関数が呼び出される（変更可能）
export const handler = async () => {

  // likesテーブルからデータを取得したい
  const input = {
    TableName: "likes"
  };

  try {
    // likesテーブりのデータを全権取得するコマンドを作成
    const command = new ScanCommand(input);
    // likesテーブりのデータを全権取得するコマンドを実行
    const response = await client.send(command);
    console.log(response);

    // 取得したデータが少し特殊な形式になってるので、
    // 扱い易い・見慣れた形式に変換
    const items = response.Items.map(item => ({
      id: item.id.S,
      createdAt: Number(item.createdAt.N),
      createdAtJST: item.createdAtJST.S,
      user: item.user.S
    }));

    // 関数の戻り値として取得したデータをAPI経由で呼び出し元（Lambda→API→ブラウザ）に送る
    // データを body に入れると、APIを経由してブラウザが body の内容を受け取れる
    // statusCode は成功をあらわす 200
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(items)
    };

  } catch (error) {
    // エラーが発生した場合は、エラーメッセージをAPI経由でブラウザに送る
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

## いいね送信（サーバーサイド・Node.js）

- 名前：`likes-post`
- ランタイム：Node.js 22.x
- アーキテクチャ：x86_64

```js
// DynamoDBを操作するライブラリの読み込み
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
// ランダムなID（UUID）を作成するライブラリの読み込み
import { randomUUID } from "crypto";

const client = new DynamoDBClient();

// APIにアクセスがあるとhandlerと言う名前の関数が呼び出される（変更可能）
export const handler = async (event) => {
  console.log("Hello, Lambda ! from likes-post");
  console.log(event);
  // ランダムなID（UUID）を作成
  const id = randomUUID();
  const d = new Date();
  // UNIXタイムスタンプ（ミリ秒）
  const timestamp = d.getTime();
  // ”いいね”された時間を日本時間で保存したい
  const jstTime = d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
  // クライアントJSから送信された user を取得
  const eventBody = event.body ? JSON.parse(event.body) : {};
  const userName = eventBody.user ? data.user : "No Name";

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
    // inputの内容をDynamoDBに保存するコマンド作成
    const command = new PutItemCommand(input);
    // inputの内容をDynamoDBに保存するコマンド実行
    await client.send(command);

    // 関数の戻り値として"success"と言う文字を呼び出し元（Lambda→API→ブラウザ）に送る
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
    // エラーが発生した場合は、エラーメッセージをAPI経由でブラウザに送る
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
- Access-Control-Allow-Headers
  - content-type

# いいね取得・保存（クライアント）

- いいねを保存

```js
  // APIにPOST
  fetch(apiUrl,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // ユーザー名をLambdaに送る。Lambdaで受け取って誰からのいいねなのか記録したい
    body: JSON.stringify({
      user: "YOUR.NAME",
    }),
  })
  .then((res) => res.json())
  .then((responseBody) => {
    console.log(responseBody);
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
  console.log(responseBody);
  // DynamoDBから取得したデータの配列
  const likes = responseBody;
  count.innerText = likes.length;
  if (responseBody.length) {
    like.classList.add('isLiked');
  }
})
.catch((err) => {
  console.log(err);
});
```