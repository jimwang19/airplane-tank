# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 交流语言

使用中文交流。

## Project Overview

飞机大战坦克 — 竖版射击H5手游原型。纯前端单HTML文件，零外部依赖，Canvas渲染，离线可玩。

当前状态：**原型开发阶段**，核心玩法可体验，视觉/手感需打磨。

## Running

浏览器直接打开 `airplane-tank-game-v2.html` 即可运行，无需构建或服务端。

## Key Files

| File | Purpose |
|------|---------|
| `airplane-tank-game-spec.md` | 产品功能规格书，所有功能定义和交付标准的唯一来源 |
| `airplane-tank-game-v2.html` | 当前原型，单文件包含全部代码（~41KB） |

## Architecture

单HTML文件架构，所有CSS/JS内联：

- **CSS**: `<style>` 内，HUD/覆盖层/控件样式
- **HTML**: 游戏容器 `#gc` 内含 canvas + HUD + 各覆盖层（开始/结束/暂停/教程）
- **JS**: IIFE 内，模块按 `// === Section ===` 注释分隔：
  - `Audio` — Web Audio API 程序化音效合成（`sfxShoot/sfxExplosion/sfxPickup/sfxHit/sfxBomb/sfxWave`）
  - `Background` — 三层视差滚动（星空/云层/地形），预生成星星60颗、云8朵
  - `Drawing` — Canvas绘制函数（玩家/敌人/子弹/粒子/UI）
  - `Spawning` — 敌人生成、波次配置、道具掉落
  - `Update` — 游戏逻辑（移动/碰撞/计时器/波次推进）
  - `Input` — 虚拟摇杆 + 键盘 + 炸弹按钮

**游戏状态**: 全局对象 `G`，包含 phase/score/lives/weaponLv/bombs/combo/wave/enemies/bullets/particles/items/texts 等。phase 取值：`menu|playing|paused|waveTransition|over`。

**Canvas**: 变量 `cx`，逻辑分辨率 480×800，`resize()` 适配实际容器。

**常见简写**: `G`=游戏状态, `cx`=canvas context, `W/H`=画布宽高, `rand/randInt/dist/clamp/lerp`=工具函数。

## Coding Guidelines

- **单文件约束**: 所有代码在同一个HTML内，不拆分文件
- **零依赖**: 不引入任何CDN或外部库
- **体积上限**: < 80KB（当前 ~41KB）
- **性能目标**: 中端手机30fps+，粒子上限100
- **代码风格**: 紧凑但可读，关键逻辑加简短注释
- **变量命名**: 游戏状态用 `G`，Canvas上下文用 `cx`，短名为主但不牺牲可读性
- **修改前先看规格书**: `airplane-tank-game-spec.md` 是功能定义的唯一来源，新增功能先更新规格再写代码

## Testing

无自动化测试。手动验证流程：

1. 浏览器打开 `airplane-tank-game-v2.html`
2. 验证开始→战斗→结束→重开完整流程
3. 检查波次推进（Wave 1-3 + Boss）
4. 检查4种敌人行为和外观
5. 检查道具拾取和武器升级
6. 检查炸弹清屏效果
7. 检查连击倍率UI
8. 检查暂停/恢复
9. 检查移动端触摸操作
10. 检查localStorage最高分持久化
