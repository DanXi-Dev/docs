# 发布到 Android / Windows

:::caution
请按文档**列出的步骤顺序**执行，以确保发布过程的顺利进行。
:::

## 打包

1. 在 `pubspec.yaml` 中修改版本号；
2. 确定使用了正确的 Android 签名证书（证书使用流程见下）；
3. 运行 `dart build_release.dart --target <android|android-armv8|windows|aab|linux> --versionCode <版本号，如 1.4.5>` 来打包。
4. 在 `build/app/` 目录下获取对应的安装包。

::::tip 证书使用流程

1. 在 `android/` 目录下创建 `key.properties` 文件，内容如下：

```properties
storePassword=证书库密码
keyPassword=证书密码
keyAlias=证书库中的证书别名
storeFile=D:\\你的证书位置\\证书文件名
```

:::caution

Windows 上，路径中的 `\` 需要使用 `\\` 转义，否则会报错。

:::

:::tip

一个证书库中可以包含多个证书，具体使用哪个证书取决于 `keyAlias` 的设置。

:::

2. 确保 `android/app/build.gradle` 中 `android.buildTypes.release` 中的 `signingConfig` 配置正确，如下：

```groovy
signingConfig signingConfigs.release
```


::::

## 发布
目前旦挞安装包的发布渠道有以下几个，每次发布时需分别操作：

### Github Releases
发布到 Github Releases 时，需要在 Github 上创建一个新的 Release，然后上传对应的 Android 和 Windows 安装包。

:::caution

建议在发布前先在本地测试一下，以确保安装包的正确性。

:::

:::tip
建议在点击发布按钮前，先发布到草稿，在后续工作完成后再正式发布。

由于接下来几个步骤都会频繁用到更新日志，建议在这一步编写并保存好更新日志，以备后续使用。
:::

:::info 有用的链接
1. 发布新版本：<https://github.com/DanXi-Dev/DanXi/releases/new>
2. 编写更新日志时，可以对照从上一个版本到这个版本的提交记录，如：<https://github.com/DanXi-Dev/DanXi/compare/v1.3.10...main>
3. 编写更新日志时，可以参考以往的更新日志的 Markdown 格式，如：<https://github.com/DanXi-Dev/DanXi/releases/edit/v1.3.10>
:::

### Android 下载站
目前暂时没有自动化的发布流程，需要手动上传安装包到服务器。

1. 保证安装包体积小于 25MB，以满足 Cloudflare 的限制；
2. 将安装包命名为 `danxi-latest.apk`，上传至 https://github.com/DanXi-Dev/DanXi-Backend/tree/main/public 文件夹下。

:::tip
如何减小安装包体积？

考虑到目前最主流平台是 armv8，`build_release.dart` 支持打包为 `android-armv8`，这样可以减小安装包体积。按照惯例，我们也会在这里只上传 `android-armv8` 的安装包。
:::

### F-Droid

1. 切换到 `foss-build` 分支工作；
2. 合并 `master` 分支到 `foss-build` 分支。注意该分支应该不包含任何非 FOSS 的代码，例如 Google 广告、Mi Push 等，**合并时应特别谨慎，注意解决相关冲突**；

:::caution


需要保证 `pubspec.lock` 是最新的。如果你设置了 Flutter 使用国内镜像（如 `pub.flutter-io.cn`），你的本地 `pubspec.lock` 中的地址将指向镜像站而非官方源（如 `pub.dev`），因此需要暂时修改你的镜像设置，然后重新执行 `flutter pub upgrade` 和 `flutter pub get`，以确保 `pubspec.lock` 中的地址指向官方源。
任何情况下都**不要向仓库提交包含国内镜像站地址的 `pubspec.lock`，否则将会导致工程管理混乱，以及 F-Droid 方面无法为你构建 APK！**

当然，如果你从未修改过 Flutter 镜像设置，或者你确保自己使用的就是官方源，那么你可以跳过这个警告。

:::

3. `foss-build` 将 Flutter 作为 [Git submodule（中文）](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97) 引入，因此需要更新 submodule。例如你目前使用的本地 Flutter 版本是 `2.2.3`，则需要执行以下命令：

```bash
# 启用子模块（仅在你没有看到 .flutter 子目录时需要执行）
git submodule update --init --recursive
# 进入子模块目录
cd .flutter
# 更新源代码和标签
git fetch --all --tags
# 切换到对应的版本。Flutter 大版本的版本号（通常是这样，请自行确认）恰好是其对应的 Git tag 别名，因此可以直接使用版本号签出：
git checkout tags/2.2.3
```

4. 在 `fastline/metadata/android/<语言>/changelogs/` 目录下，创建一个新的文件，文件名为当前版本 Build 号，例如 `333.txt`，并在其中编写更新日志。可以参考以往的更新日志的格式；

:::caution

各个语言都需要编写更新日志，否则 F-Droid 会认为该版本没有更新日志，从而不会发布。请不要图省事而只写中文的更新日志。

:::

5. （可选）本地执行 [F-Droid 构建元文件](https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/io.github.danxi_dev.dan_xi.yml) 中含有 `submodules: true` 的版本下的 `build` 部分的命令，确保能构建成功；
6. 提交分支并推送到远程仓库，**打上版本号 tag，格式为 `foss-v1.2.3`**（同样缺一不可，请勿为了图省事而忽略）。

:::caution

`git push` 默认不会推送 tag 到仓库，需要使用 `git push --tags`。

请务必在推送后到 GitHub 仓库页面点击最新提交，确定 tag 已经推送成功。

:::

7. 等待 F-Droid 构建服务器发现新的 tag，自动构建并发布，大约需要 3-7 天。你可以在 [F-Droid 构建状态](https://f-droid.org/zh_Hans/packages/de.storchp.fdroidbuildstatus/) 应用中查看构建状态。

:::info 有用的链接

1. FAQ，介绍了 F-Droid 的构建流程（英文）：<https://gitlab.com/fdroid/wiki/-/wikis/FAQ>
2. 服务器整体构建状态监控（英文）：<https://monitor.f-droid.org/builds/build>
3. F-Droid 构建问题请求跟踪（英文）：<https://gitlab.com/fdroid/fdroiddata/-/issues>
4. 旦挞的构建元文件：<https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/io.github.danxi_dev.dan_xi.yml>
5. 构建元文件的格式说明（中文）：<https://f-droid.org/zh_Hans/docs/Build_Metadata_Reference/>

:::

:::tip

必要时（如遇到构建失败等问题），可以向上述仓库提交 issue 寻求帮助，或者 fork 该仓库，对我们的元文件进行修改后，发起 Merge request。可以参考[我之前的 MR](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/12544)。

:::

### Google Play

在 Google Play 中发布需要打包为 `.aab` 格式的安装包，然后上传到 Google Play Console。

由于 Google Play Console 的操作较为直观，这里不再赘述具体步骤。

## 公告
### 应用内更新提醒

1. 在 [DanXi-Dev/DanXi-Backend](https://github.com/DanXi-Dev/DanXi-Backend) 仓库中，打开 `all.json` 文件，找到 `"maxVersion": -2` 和 `"maxVersion": -3` 的两个条目，将其 `content` 字段的值改为当前版本号和更新日志；

:::caution

字符串内容需要转义，例如 `"` 需要写成 `\"`，换行符需要写成 `\n`。请不要图省事而直接复制粘贴手写的更新日志，否则可能会导致 JSON 格式错误。

`all.json` 目前已弃用，仅在旧版本中使用。新版本其实只需要修改 `tmp_wait_for_json_editor.toml` 文件即可。但是为了旧版本能收到更新提醒，仍然需要修改 `all.json`。
:::

:::info 有用的链接

1. JSON 格式化和转义工具（中文）：<https://www.bejson.com/>

:::

2. 在 [DanXi-Dev/DanXi-Backend](https://github.com/DanXi-Dev/DanXi-Backend) 仓库中，打开 `tmp_wait_for_json_editor.toml` 文件。找到 `[latest_version]` 下的 flutter 字段，修改其值。

### 官网
在 [DanXi-Dev/danxi-dev.github.io](https://github.com/DanXi-Dev/danxi-dev.github.io) 仓库中找到 `src/views/ProjectAppView.vue` 文件，按需修改 `<script>` 标签中的 `latestVersion` 和 `oldestVersion` 变量。

:::tip
如有特殊需求，请同步更改该网页内的其他部分（如特性介绍）。
:::


### QQ 群组

根据实际运营情况，也需要在 QQ 群组中发布新版本的安装包及更新日志。