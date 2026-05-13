# 飞机大战坦克 — Copilot 指引

使用**中文**交流。

## 关键约束（优先于一切）

- **单文件**：所有代码必须在 `airplane-tank-game-v2.html` 内，**严禁**拆分文件
- **零依赖**：不引入任何 CDN 或外部库
- **体积上限**：< 80KB（当前 ~41KB）
- **修改前先看规格书**：[airplane-tank-game-spec.md](../airplane-tank-game-spec.md) 是功能定义的**唯一来源**，新增功能先更新规格再写代码

## 运行

浏览器直接打开 `airplane-tank-game-v2.html`，无需构建或服务端。

## 代码结构

`airplane-tank-game-v2.html` 内部用 `// === Section ===` 分隔模块：

| Section | 内容 |
|---------|------|
| `Audio` | Web Audio API 程序化音效（`sfxShoot/sfxExplosion/sfxPickup/sfxHit/sfxBomb/sfxWave`） |
| `Background` | 三层视差滚动（星空/云层/地形） |
| `Drawing` | Canvas 绘制函数 |
| `Spawning` | 敌人生成、波次配置、道具掉落 |
| `Update` | 游戏逻辑（移动/碰撞/计时器/波次推进） |
| `Input` | 虚拟摇杆 + 键盘 + 炸弹按钮 |

**关键全局变量**：`G`（游戏状态）、`cx`（Canvas context）、`W/H`（画布宽高）

`G.phase` 取值：`menu | playing | paused | waveTransition | over`

工具函数：`rand()` `randInt()` `dist()` `clamp()` `lerp()`

## 性能目标

- 中端手机 30fps+
- 粒子上限 100（`G.particles` 数组）

## 测试

无自动化测试，手动验证。详见 [CLAUDE.md](../CLAUDE.md#testing)。
