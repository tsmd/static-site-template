# Static Site Template
  
## 開発のはじめ方

### 用意するもの
- Node.js ~7.x
- NPM ~5.x
- Docker + Docker Compose

### 必要モジュールのインストール
  ```
$ npm install
```

### 開発をはじめるコマンド
以下のコマンドで、ポート 3002 番でアクセスできる Apache サーバーが立ち上がります。

```
$ docker-compose up
```

次に、別のコンソールで以下のコマンドを実行します。

```
$ npm run start
```

  `http://localhost:3000` にアクセスすると、BrowserSync が有効になった開発環境にアクセスできます。

#### 自動リロードの無効化
ファイルの変更があると、BrowserSync の機能を使ってブラウザが自動的にリロードされます。これを無効化したい場合、`npm run start` コマンドの代わりに以下のコマンドを使用します。

```
$ npm run start-no-reload
```

### ビルドコマンド
以下のコマンドを実行すると、ファイル一式が `htdocs` ディレクトリ以下に展開され、CSS と JS は最小化されます。
```
$ npm run build
```

### （付録）Apache サーバーの設定
Docker を使用しない場合、Apache サーバーを自前で立ち上げることでも開発環境を用意できます。

Apache サーバーを以下のように設定してください。

- ドキュメントルートを、`/path/to/this/repository/.tmp` にする  
  （このディレクトリはリポジトリの clone 時は存在しませんが、後述の開発用コマンドを実行することで作成されます）
- [`AllowOverride` の設定で .htaccess を使用可能にする](https://httpd.apache.org/docs/current/ja/mod/core.html#allowoverride)
- あるいは、[`index.php` をディレクトリインデックスとして使用する](https://httpd.apache.org/docs/current/ja/mod/mod_dir.html#directoryindex)
- バーチャルホストは自由に設定可

#### 環境変数の設定
**もし、立ち上げた Apache サーバーのバーチャルホストが `localhost` 以外の場合**、そのホスト名を環境変数に設定する必要があります。`.env.example` ファイルを同じディレクトリにコピーし、ファイル名を `.env` としてください。このファイルをテキストエディタで編集し、`APACHE_VHOST` の値を適切なホスト名に書き換えてください。

```
APACHE_VHOST=staticsite.local
```
