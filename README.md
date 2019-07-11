# Static Site Template

## ディレクトリ構成

```
.
├── dist ...................... ビルドされたファイルの出力先
└── public .................... 基底フォルダ
    ├── assets
    │   ├── images
    │   │   └── sprites ........SVG スプライト用画像
    │   │       └── icons
    │   ├── javascripts ....... コンパイル後の JavaScript 出力フォルダ
    │   ├── javascripts-src ... JavaScript ソース
    │   ├── stylesheets ....... コンパイル後の CSS 出力フォルダ
    │   └── stylesheets-src ... CSS ソース
    │       └── components .... 各 BEM Block をファイルに分けて格納
    └── images ................ トップページで使用する画像
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

### 画像アセットの最適化

以下のコマンドを実行すると、画像ファイルの圧縮が行われます。

```
$ npm run imagemin
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
