# pnpm
### pnpm文档手册学习与信息参考网址：https://www.pnpm.cn/
## 安装：


343423564664365345

dhfaiueurwoeu

- npm i -g pnpm;
- pnpm install 
- cd packages/business/platform/video
- npm run dev:cyGemp
- npm run dev:cyIvaip
 
## 使用
1. 由于修改了主题样式文件的地址，现在统一使用cy-theme中的样式，所以video项目使用less主题时:
- 需要将原来的 `@import '/@/assets/css/theme/theme-blue;` 更改为 `@import '/theme-src/theme/theme-blue.less';`
> 这是由于 cy-theme项目 既可以当做依赖导出给 cy-video 且本身也需要自己使用，
> 所以将cy-theme的src目录指向别名更改为 theme-src, cy-video将指向别名直接更改到 cy-theme 的相对路径来达到两边皆可使用的目的;
> 
2.其他组件于上同理，
- 如 cy-compoenet 的src 目录对应  /components-src/;
- > 需要注意的是，在cy-component中引用自身的组件 也需要使用此别名，
（/components-src/ 代替 /@/ ); 否则 video项目报错；
>
3.当修改依赖组件时(如components、menuPermission),在根目录下将依赖导入到video
- 如将 components导入video时： `pnpm install -r cy-components@1.1.1 --filter cy-video`
- 如将 menuPermission： `pnpm install -r cy-menu-permission@0.0.1 --filter cy-video`
> -r 为把包安装在packages中， -w表示把包安装在 root 下，cy-components@1.1.1 是包名+版本号，注意：
版本号需要比上一版本高才行； --filter cy-video 表示只把安装的新包装入 cy-video 这个 package 中.
# 服务器更包
地址： 139服务器的地址： cd /usr/local/video