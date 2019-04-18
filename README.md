# Static Site Template

## ディレクトリ構成

```
.
├── .tmp ...................... コンパイルしたファイルの一時的格納先。バージョン管理に含まない
├── dist ...................... ビルドされたファイルの出力先
├── public .................... 静的ファイル。ビルドすると dist にコピーされる
│   ├── assets
│   │   ├── fonts
│   │   └── images
│   ├── images ................ トップページで使用する画像
└── src ....................... JS, Sass などコンパイルが必要なファイル
    └── assets
        ├── javascripts ....... JavaScript
        ├── images
        │   ├── sprites ........SVG スプライト用画像
        │   │   └── icons
        └── stylesheets ....... Sass
            └── components .... 各 BEM Block をファイルに分けて格納
```

## 開発のはじめ方

### 用意するもの

- Node.js v8 以上
- NPM v5 以上

### 必要モジュールのインストール

```
$ npm install
```

### 開発をはじめるコマンド

以下のコマンドを実行します。

```
$ npm run start
```

`http://localhost:3000` にアクセスすると、BrowserSync が有効になった開発環境にアクセスできます。

#### 自動リロードの無効化

ファイルの変更があると、BrowserSync の機能を使ってブラウザが自動的にリロードされます。これを無効化したい場合、`npm run start` コマンドの代わりに以下のコマンドを使用します。

```
$ npm run start-no-reload
```

### 画像アセットの最適化

以下のコマンドを実行すると、画像ファイルの圧縮が行われます。

```
$ npm run gulp -- imagemin
```

### ビルドコマンド

以下のコマンドを実行すると、ファイル一式が `dist` ディレクトリ以下に展開され、CSS と JS は最小化されます。

```
$ npm run build
```

### コード品質ツール

```
$ npm run lint
```

エラーを自動修正する場合は以下。

```
$ npm run lint -- --fix
```
