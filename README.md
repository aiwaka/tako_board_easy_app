# Tako Board easy app

バージョン0.3.2

## 概要

うちのうさぎのお世話記録をつける掲示板.

## 仕様

- メールアドレスを利用したログイン認証機能（Firebase Authentication）.
- リモートデータベースを用いた記録（Firestore）.
- レスポンシブデザインで携帯端末でも見やすい.
- 日付区間を指定して過去の記録を読み込める（デフォルトは当日から一週間前まで）.
- レコード追加時には全体の再読み込みがなされずに反映されるため処理が軽量.
- レコードの削除は投稿した本人のみが可能.
- 記録を付けるのを忘れても任意の時刻を簡単に入力可能.
- 長いコメントは自動で折りたたまれ, クリックすると全文を見られる.
- 画像投稿機能を追加. Firebase Storage に保存され各レコードと紐付けられる.
- Firebase の API の FirestoreDataConverter を使用することでデータの型付けを得, 可読性・保守性を向上.

## 画像

<p>
<img alt="トップ画面" src="https://user-images.githubusercontent.com/38373453/172039350-6e398f0c-c1f2-4e0c-ad02-fa18ffcf6862.jpg" width="45%">
<img alt="ログイン画面" src="https://user-images.githubusercontent.com/38373453/172039382-ece9ce18-8dbc-4311-806a-63aeceb807a6.jpg" width="45%">
<img alt="入力" src="https://user-images.githubusercontent.com/38373453/172039496-e5a79720-543e-4283-8a9f-8bbe4af1aae4.jpg" width="45%">
<img alt="レコードリスト" src="https://user-images.githubusercontent.com/38373453/172039458-2f4b2fbd-e42c-4717-936e-9b453fa8c0f9.jpg" width="45%">
</p>

## 使用技術

- Firebase（Firestore, Authentication, Storage）
- Vue.js 3（Composition API）
- Typescript
- SCSS

## 注意

家族専用なので現在新規登録等は不可能.

## Project setup

```
npm install
```

or

```
yarn install
```

### Compiles and hot-reloads for development

```
npm run serve
```

or

```
yarn serve
```

### Compiles and minifies for production

```
npm run build
```

or

```
yarn build
```

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
