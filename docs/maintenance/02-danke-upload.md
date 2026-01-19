# 更新蛋壳课程列表

本部分介绍如何在每学期人工维护蛋壳中的课程列表。

## 1. 获取学期课程列表
将使用 [ppolariss/FDUCourseData](https://github.com/ppolariss/FDUCourseData) 仓库爬取课程数据。

::::warning 注意
复旦的「学期」包括：秋冬、寒假、春夏、暑假。每个学期的课程列表都是独立的。**目前蛋壳也需要寒暑假学期的课程信息，请不要忘记爬取这两个学期的数据。**

总之，你每个学期的例行更新时，一般都是需要更新两个学期的数据。每年总共需要更新四个学期的数据。
::::

该项目的脚本非常简单，按照步骤操作即可，这里不再赘述。总之，你会得到一个当前学期信息的 JSON 文件。

## 2. 上传课程列表

上传课程的脚本在 [OpenTreeHole/curriculum_board_backend_next](https://github.com/OpenTreeHole/curriculum_board_backend_next) 仓库的 `cli` 目录下。该脚本使用 Rust 编写，因此请先安装 Rust 环境。

Clone 仓库后，进入 `cli` 目录，运行：

```bash
cargo run -- --help
```

即可查看帮助信息。你也可以查看 `cli/src/main.rs` 文件了解更多信息。下面是对几个复杂参数的解释：

- `--db_url`：不是数据库的 URL，而是后端上传课程的 URL，例如 `https://danke.fduhole.com/api/courses`。请向运维同学了解该 URL。
- `--auth_token`：具有管理员权限的 token，用于上传课程。应当从 Auth 前端（一般为 <https://auth.fduhole.com>）登录获得 access token。
- `--year`：学年，例如 `2023` 代表 `2023-2024` 学年。
- `--semester`：学期，`1` 代表秋冬学期，`2` 代表寒假，`3` 代表（第二年的）春夏学期，`4` 代表（第二年的）暑假。

运行脚本，上传 JSON 文件即可。

::::tip 错误恢复
**不小心写错了学期/写错了学年/选错了 JSON 文件，已经上传了一半，怎么办？** 目前唯一的办法是运维同学利用 SQL 删除错误的课程。如果不巧和现有学期混合，则**无法恢复**了。因此，请务必确认无误后再开始执行！

**上传到一半不小心中止/断网了，怎么办？** 取决于后端同学的实现，目前的实现下，重复上传课程会报 400 错误，这会导致脚本中止。你需要修改脚本中对状态码的判断，使其忽略该错误码，然后重新运行脚本即可。
::::

## 3. 更新数据库依赖关系

::::info 哎呀……
这是 2026-01-19 添加的临时步骤，作为在后端解决 Bug 之前的权宜之计。
::::

由于目前后端的设计问题，上传数据后，还需手动拆分教师列表（在上传时以 `,` 分割）、维护教师和课程组的依赖关系表。否则，**在客户端将无法正常搜索到新课程**。

目前有**两个更新方案，任选其一**：

### 3.1. 使用后端脚本

[这里](https://github.com/OpenTreeHole/backend/tree/main/danke_utils) 是后端同学临时编写的工具脚本。

Clone 该仓库后，进入 `danke_utils` 目录，解除对 `GenerateTeacherTable(DB)` 调用前的注释，然后运行：

```bash
$ export DB_TYPE=<mysql 或 postgres。请询问运维同学>
$ export DB_URL=<数据库连接 URL。请询问运维同学，或直接请运维同学帮忙执行>
$ go run main.go
```

### 3.2. 手动执行 SQL

也可以请运维同学直接在数据库中执行以下 SQL 语句：

::::warning 注意

1. 这段语句**由 AI** 根据上面的工具脚本生成。虽然在生产环境中已经测试通过，但仍然建议**先仔细阅读确认无误后再执行**。
2. 这段语句的效率较低，可能会占用较多数据库资源，建议在选课低峰期执行。
::::

```sql
START TRANSACTION;

-- 1. 创建临时表，存放拆分后的教师名字
DROP TEMPORARY TABLE IF EXISTS split_tmp;

CREATE TEMPORARY TABLE split_tmp (
  course_id INT,
  course_group_id INT,
  teacher_name VARCHAR(255),
  INDEX idx_tmp_teacher_name (teacher_name)
);

-- 2. 拆分逗号分隔的字符串，存入临时表
INSERT INTO split_tmp (course_id, course_group_id, teacher_name)
WITH RECURSIVE split AS (
  -- 初始查询：取第一个逗号前的名字
  SELECT
    id AS course_id,
    course_group_id,
    TRIM(SUBSTRING_INDEX(teachers, ',', 1)) AS teacher_name,
    SUBSTRING(teachers, LENGTH(SUBSTRING_INDEX(teachers, ',', 1)) + 2) AS rest
  FROM course

  UNION ALL

  -- 递归查询：处理剩余的字符串
  SELECT
    course_id,
    course_group_id,
    TRIM(SUBSTRING_INDEX(rest, ',', 1)) AS teacher_name,
    SUBSTRING(rest, LENGTH(SUBSTRING_INDEX(rest, ',', 1)) + 2) AS rest
  FROM split
  WHERE rest IS NOT NULL AND rest <> ''
)
SELECT course_id, course_group_id, teacher_name
FROM split
WHERE teacher_name <> '';

-- 3. 插入新老师 (去重)
-- 使用 IGNORE 忽略已存在的名字
INSERT IGNORE INTO teacher (name)
SELECT DISTINCT teacher_name
FROM split_tmp;

-- 4. 插入关联表 (去重)
INSERT IGNORE INTO teacher_course_groups (teacher_id, course_group_id)
SELECT DISTINCT 
  t.id, 
  s.course_group_id
FROM split_tmp s
JOIN teacher t ON t.name = s.teacher_name;

COMMIT;
```

