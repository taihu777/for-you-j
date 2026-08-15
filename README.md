# 克制型互动见面邀请网页

这是一个静态互动网页。主活动、后续答案、分享选择与当前进度会自动保存在当前浏览器；只有用户到达最终确认页并主动点击“确认发送”后，允许分享的数据才会提交到 Supabase。

## 项目结构

```text
<项目文件夹>/
├── index.html                 # 网页入口与脚本加载顺序
├── styles.css                # 页面样式与手机适配
├── app.js                    # 状态、页面流程、隐私筛选与确认页
├── storage.js                # localStorage 统一读写
├── supabase-config.js        # Supabase 公开配置
├── supabase-client.js        # 仅 INSERT 的 REST 提交模块
├── supabase/
│   └── schema.sql            # 建表、RLS、INSERT policy 与权限
└── assets/
    └── sand-heart.jpg
```

## 本地草稿

- localStorage key：`date-invitation:draft:v1`
- 只保存当前状态，不保存按键历史、删除过的答案、停留时间、鼠标轨迹或设备指纹。
- 两个后续想象题统一保存为 `{ answer, share }`，其中 `share` 默认是 `false`。
- 刷新或关闭页面后，会恢复答案、分享状态、页面进度、`submission_id` 和提交成功状态。
- 项目不会调用 `localStorage.clear()`；如需清理，只会删除自己的 storage key。
- Supabase 成功后会立刻压缩本项目草稿：移除整个 `questions`，只保留当前有效活动、`submissionId`、`submitted` 等防重复所需状态。

## 隐私与提交边界

`buildSubmissionPayload()` 会重新构造允许上传的数据，不会直接提交完整 state。请求根级只包含 `submission_id`、`main_activity` 和 `shared_answers`。

任何 `share === false`、未回答或空答案都不会出现在 `shared_answers` 中；不是以 `share: false` 的形式上传，而是整个字段都不存在。

## 配置 Supabase

1. 在 Supabase 新建或选择项目。
2. 打开 `SQL Editor`，复制并执行 [`supabase/schema.sql`](supabase/schema.sql)。
3. 在项目设置中复制 Project URL 和 publishable key，并写入 `supabase-config.js`。

前端文件中绝对不能出现 `service_role` key。publishable key 可以出现在前端，但安全边界必须由 RLS 和数据库权限保证。

## 数据库权限

`supabase/schema.sql` 创建 `public.submissions`：

- `id uuid primary key`
- `submission_id uuid unique`
- `main_activity jsonb`
- `shared_answers jsonb`
- `submitted_at timestamptz`

匿名网页用户的权限为：

- `INSERT`：允许，但只允许写入 `submission_id`、`main_activity`、`shared_answers`
- `SELECT`：不授予，也没有 policy
- `UPDATE`：不授予，也没有 policy
- `DELETE`：不授予，也没有 policy

数据只在 Supabase 明确返回成功后标记为已发送。网络失败或请求超时不会删除本地草稿，按钮会重新启用，并使用同一个 `submission_id` 重试。只有 PostgreSQL `23505` 且错误明确命中 `submissions_submission_id_unique` 约束时，HTTP 409 才会视为同一提交已经存在；其他 409 均继续报错。

## 发布

这是纯静态项目，可以部署到 GitHub Pages、Cloudflare Pages、Netlify 或其他静态托管。发布时需包含根目录下的四个 JS 文件、`index.html`、`styles.css` 和 `assets`；`supabase/schema.sql` 只用于数据库初始化，不会被网页执行。
