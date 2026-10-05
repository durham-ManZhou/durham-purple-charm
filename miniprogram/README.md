# 微信小程序部署（PRD 技术流）

本目录是可上传微信开发者工具的原生壳。产品交互与全部页面在 H5 Demo 中完成，正式发布用 `web-view` 加载已配置的业务域名。

1. 将本仓库的 H5 部署到 HTTPS 域名（Lovable / 自有服务器均可）。
2. 登录[微信公众平台](https://mp.weixin.qq.com/)，完成主体认证，记下 AppID。
3. 开发 → 开发管理 → 开发设置 → 业务域名：添加 H5 域名并放置校验文件。
4. 用微信开发者工具导入本 `miniprogram/` 目录，把 `project.config.json` 的 `appid` 换成真实 AppID。
5. 把 `pages/index/index.js` 的 `h5Url` 改成上线地址，例如 `https://your.domain/?screen=school-home`。
6. 填写用户隐私保护指引（H5 内「隐私保护指引」页可对照），选择教育类目，配置客服与订阅消息。
7. 真机预览通过后上传代码并提交审核发布。

网页 Demo 里的拨号、邮件、地图、客服会话、分享卡片是微信原生能力的可验证等价交互；接入主体后替换为 `wx.makePhoneCall`、`wx.openCustomerServiceChat`、`wx.showShareMenu` 等接口即可。
