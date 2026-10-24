# ONpoint · 五通道交互路演

本轮交付是布局与交互版本，统一深绿底、荧光绿、像素通道和细线框。信息结构参考 CareFlow；视觉节奏参考用户提供的 project-story-demo.html 与 Alipay Payathon 页面。没有复制支付宝品牌、图片或标识。

## 先打开哪个文件

**直接双击 `ONpoint-交互路演.html`。** 它包含全部样式、脚本与回放数据，无需启动服务器、安装依赖或配置模型。

日常编辑使用 `dist/` 中的分离文件：

- `index.html`：各章节布局、栏目、导航及主要静态文案。
- `story.css`：颜色、字体、间距、动效和响应式布局。
- `story.js`：章节标题、架构节点说明、方案卡标注、体验交互、流程复用交互。
- `replay-data.js`：ONpoint 后端实际导出的 Store 状态，勿手工编造任务与执行结果。

编辑后运行 `node build-single.cjs`，更新单文件交付；`node verify.cjs` 检查数据关联、状态与打包结果。

## 五个入口放什么

| 通道 | 主要信息 | 布局与交互 |
|---|---|---|
| 01 为什么做 | 用户的不确定、为什么做售后履约 | 左侧三个追问，右侧四步解决链路，底部一句结论 |
| 02 亲自体验 | 输入、事实、方案、授权、回执 | 左侧三种场景，中间对话/方案，右侧证据与结果；三种服务视角 |
| 03 如何实现 | 每层职责、输入输出与源码对应 | 左侧六节点消息链，右侧节点详情；可点选或逐步点亮 |
| 04 决策有凭据 | 方案卡为什么可核验 | 左侧四项结构导航，右侧方案卡对应区域高亮，可进入确认体验 |
| 05 经验可复用 | 人工处理如何进入下一案 | 左侧 v1/v2 对比，右侧五阶段与流程资产护照 |

`1–5` 切换章节，`Esc` 返回五通道；方向键切换相邻章节。输入框和弹窗打开时不会误触章节切换。尊重系统减少动效设置。

## 建议录像顺序

首页 → 背景 → 体验 → 查询合成订单 → 申请追踪 → 确认弹窗 → 任务回执 → 架构节点 → 方案卡 → 五步流程复用。

默认体验是发布后的 v2 流程；“首次处理”案例展示 v1 下转人工、坐席接手、人工准备方案再确认执行。“投诉争议”展示停止自动处理。只读查询也可以直接完成咨询，不创建任务。

输入框支持已录制问句，不接受任意文本后伪造智能回复。可输入：

- `票退了，钱咋还没回来？帮我查查`
- `我要投诉退款并追究责任`
- 查询完成后输入 `申请追踪`

## 与 ONpoint 代码的联系

来源提交：`3c3102a671c321ef7d38fe825d6a19ad49dcfffa`。

19 个回放帧由真实 Go 引擎执行生成，使用原本的 Case、Plan、Proposal、Task、Evidence、Change、Snapshot 和 Store 字段。页面以这些字段渲染，并非手写一个独立故事冒充后端结果。确认操作切换到后端已生成的对应帧，不发起真实业务动作。

导出时关闭 SLA 配置，因此不展示无渠道依据的到账承诺；JEV/LLM 不参与本次录制。前端没有真实模型调用、实际退款、后台主动通知、真实坐席身份、自由文本通用理解等能力。页面持续标注合成案例与离线回放。

重要字段对应：

| 前端区域 | 后端数据 / 请求动作 |
|---|---|
| 聊天与状态 | `Store.Cases[caseID].Messages/State/Route` |
| 查询事实 | `message` → `Case.Facts/QueryOrder/Evidence` |
| 待确认方案 | `request_tracking` → `Case.Plans`、`Store.Proposals` |
| 人工接手 | `accept`、`human_prepare`；同一 CaseID |
| 确认执行与回执 | `confirm`：PlanID、PlanToken、Confirmed → `Store.Tasks` |
| 支持完成 | `resolved`；支付仍为 PROCESSING |
| 只读咨询完成 | `consultation_done`；无任务 |
| 流程复用 | `draft` → `change_replay` → `change_approve` → `change_publish` |

## 放进 ONpoint 项目

运行：

```powershell
.\Install-IntoONpoint.ps1 -ProjectRoot '你的ONpoint项目根目录'
```

它只复制本包 `dist/` 到项目的 `dist/story/`。原工作台 `dist/index.html` 保留。启动原 Go 服务后，访问 `/story/index.html`。后端已有的静态文件服务即可托管，无需改语言或新增服务。

本次已安装到工作区审查副本 `work/onpoint-audit/dist/story/`，没有推送 GitHub。

## 给后续 Agent 的边界

前端代码以 `dist/story/` 为独立模块维护。后端修复无需修改当前布局；若改 Case/Plan/Task 字段，应同步导出器与回放渲染。`integration/export_story_test.go` 是导出器源码，可复制到 ONpoint 根目录作为测试文件（沿用当前仓库已有测试辅助函数）。运行：

```powershell
$env:ONPOINT_STORY_EXPORT = '你的输出目录\replay-data.js'
go test -run '^TestExportStoryReplay$' -v
```

未设置输出路径时默认写入 `dist/story/replay-data.js`。更新数据后再打包单文件。

未来实时接入只需增加单独的 Transport，把当前回放状态切换换成对 `/api/state` 的请求；保留确认令牌、服务端权限和错误结果，不能让前端自行写业务状态。此版本交付范围为纯前端回放。

## 已完成的验证

- 后端导出器通过，输出 19 个真实引擎状态帧。
- 数据校验：查询不建任务、确认令牌与任务对应、同案连续、人工路径、投诉路径、支付状态不被改写、回放与发布顺序。
- JavaScript 语法、单文件内联脚本和离线依赖检查通过。
- 浏览器实际走通查询 → 方案 → 确认弹窗 → 回执，检查了五章导航、架构节点、方案区域展开和发布资产展示。
- 检查宽屏及窄屏布局；预览截图在 `preview/`。未声称完整自动化浏览器测试或生产业务验收。
- 内置浏览器安全策略不允许直接访问 file 协议，因此单文件通过了内联脚本与离线依赖校验；浏览器交互验证使用本机 HTTP 预览。用户可在本地浏览器双击打开 HTML。
