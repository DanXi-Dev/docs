# Feature

一个 *Feature* 是指首页中显示的一个功能模块，或者称为一个「小部件」。此外，它还可以是一条首页顶部通知（例如「未连接到内网」的卡片）。

## 结构
### Feature
`Feature` 抽象类定义了一个 *Feature* 的基本结构，包括标题、描述、图标、动作、布局等信息。

如果需要创建一个新的 *Feature*，需要继承 `Feature` 类，并实现其方法。之后，还需要在 `FeatureMap` 中注册该 *Feature*。

### FeatureMap
`FeatureMap` 工具类用于管理所有的 *Feature*，并补充一些额外的信息，例如 *Feature* 的内部名称、构造方法、显示名称、用户组等。

**内部名称**是指 *Feature* 的唯一标识符（如 `"fudan_daily_feature"`），用于渲染首页时，在 `FeatureMap` 中查找指定的 *Feature* 并创建。

**显示名称**是指 *Feature* 在首页的自定义布局功能中显示的名称（如 `"复旦每日"`）。由于显示名称需要国际化，因此通常用一个 `(BuildContext) -> String` 的函数来表示。

**用户组**是指 *Feature* 的用户组，用于控制 *Feature* 在不同账户登录时的显示情况。例如，「复旦每日」只在复旦用户登录时显示，用户组为默认值 `[UserGroup.FUDAN_UNDERGRADUATE_STUDENT, UserGroup.FUDAN_POSTGRADUATE_STUDENT, UserGroup.FUDAN_STAFF]`。

:::tip
用户组信息由首页在显示 *Features* 时用于判断是否需要显示，而不是由 *Feature* 自身来判断。这是因为 *Feature* 本身并不知道当前用户的信息。

用户组也被用于
:::

::::tip
`FeatureMap` 不管理特殊的 *Feature*，例如顶部通知和快捷方式（即 `CustomShortcutFeature`），因为它们的创建方式与普通 *Feature* 不同：是动态生成并插入到首页的。

:::note
`CustomShortcutFeature` 代表一个快捷方式卡片，用于跳转到某个 HTTP URL。
:::

`FeatureMap` 也不记录首次使用时默认的排序方式。这目前由在 `constant.dart` 中定义的 `DashboardCard` 数组来管理。
::::


### DashboardCard
`DashboardCard` 是一个 *Feature* 卡片的序列化表示，用于表示在设置项中保存用户自定义的首页布局的一项。

它目前有几个特殊字段，专用于表示快捷方式信息。

:::tip
`DashboardCard` 不可用于表示顶部通知类 *Feature*。

为了表示首页布局，它的内部名称额外有两个可能的取值：`FEATURE_NEW_CARD` 和 `FEATURE_DIVIDER`。它们分别表示（接下来的内容会包含在）一个新的卡片和一个分隔线。
:::

## 如何做？
### 创建新的 *Feature*
1. 在 `feature` 目录下创建一个新的 Dart 文件，例如 `my_feature.dart`。
2. 在 `my_feature.dart` 中，创建一个新的类，继承 `Feature` 类，并实现其方法。可参考 `dorm_electricity_feature.dart` 中的示例和注释；
3. 依据 `base_feature.dart` 中的注释完成元信息的定义。