# carlol 独立站

一个简约风格的英文独立站，可部署到 GitHub Pages，自带产品管理后台。

## 文件结构

```
carlol-store/
├── index.html      # 店铺主页（顾客看到的页面）
├── admin.html      # 产品管理后台（只有你用）
├── products.js     # 产品数据（由 admin 导出替换）
├── styles.css      # 样式
├── script.js       # 店铺逻辑
└── admin.js        # 后台逻辑
```

## 如何添加 / 修改产品

1. 在本地打开 `admin.html`（双击即可，或拖到浏览器里）。
2. 在表单里填写产品名称、分类、价格、描述、图片。
   - **图片**：可以填图片网址（URL），也可以点 "Upload image" 上传本地图片（会自动转成 base64 嵌入，无需额外托管）。
3. 点 **Add Product** 添加；点列表里的 **Edit** 可编辑，**Delete** 可删除。
4. 全部改完后，点右上角 **Save & Download products.js**，会下载一个新的 `products.js`。
5. 用下载的新文件**替换**项目里旧的 `products.js`。
6. 重新上传到 GitHub 即可。

> 提示：修改会保存在浏览器 localStorage 里，下次打开 admin 还在。点 "Reload from products.js" 可以撤销所有本地改动。

## 部署到 GitHub Pages

### 方法一：网页上传（最简单）

1. 登录 GitHub，点右上角 **+** → **New repository**，仓库名随意（例如 `carlol-store`），选 **Public**，创建。
2. 在仓库页面点 **Add file** → **Upload files**，把 `carlol-store` 文件夹里的**所有文件**（index.html、admin.html、products.js、styles.css、script.js、admin.js）拖进去，点 **Commit changes**。
3. 进入仓库 **Settings** → 左侧 **Pages**。
4. **Source** 选 `Deploy from a branch`，**Branch** 选 `main` / `root`，点 **Save**。
5. 等 1–2 分钟，页面顶部会显示你的网址，例如：
   ```
   https://你的用户名.github.io/carlol-store/
   ```

### 方法二：用 Git 命令

```bash
git init
git add .
git commit -m "init carlol store"
git branch -M main
git remote add origin https://github.com/你的用户名/carlol-store.git
git push -u origin main
```
然后在 Settings → Pages 里开启 Pages 即可（同上第 3–5 步）。

## 自定义

- **品牌名 / 文案**：直接编辑 `index.html` 里的文字。
- **邮箱**：把 `script.js` 里的 `hello@carlol.store` 改成你的邮箱（顾客结账会发邮件给你）。
- **配色 / 字体**：编辑 `styles.css` 顶部的 `:root` 变量。

## 结账说明

本店铺采用 **邮件询价结账**：顾客点 Checkout 会打开邮件客户端，把购物车内容发到你的邮箱。你收到邮件后手动联系顾客完成付款和发货。适合小批量、定制化的独立站起步。
