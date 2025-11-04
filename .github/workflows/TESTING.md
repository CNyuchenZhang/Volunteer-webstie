# 测试功能说明文档

本文档详细说明了志愿者平台项目中所有测试的功能和测试内容。

---

## 测试概览

本项目采用多层次的测试策略，确保代码质量和系统稳定性：

- **单元测试**：测试各个服务和组件的独立功能
- **集成测试**：测试服务之间的交互和 API 集成
- **端到端测试**：测试完整的用户流程
- **性能测试**：测试系统在高负载下的表现
- **安全测试**：检测代码和依赖中的安全漏洞

---

## 后端单元测试

### 用户服务测试 (`services/user/users/tests.py`)

#### 1. 用户注册功能 (`UserRegistrationTestCase`)

- **`test_register_volunteer_success`**: 测试志愿者用户注册成功
  - 验证注册流程
  - 验证返回的用户信息和 token
  - 验证用户角色为 `volunteer`

- **`test_register_organizer_success`**: 测试组织者用户注册成功
  - 验证组织者注册流程
  - 验证用户角色为 `organizer`

- **`test_register_duplicate_email`**: 测试重复邮箱注册失败
  - 验证邮箱唯一性约束
  - 验证错误响应

- **`test_register_password_mismatch`**: 测试密码不匹配
  - 验证密码确认验证逻辑

- **`test_register_missing_required_fields`**: 测试缺少必填字段
  - 验证表单验证逻辑

- **`test_register_admin_role_blocked`**: 测试管理员角色注册被阻止
  - 验证管理员角色不能通过注册接口创建

#### 2. 用户登录功能 (`UserLoginTestCase`)

- **`test_login_success`**: 测试登录成功
  - 验证登录接口返回 token
  - 验证用户信息正确

- **`test_login_invalid_credentials`**: 测试无效凭据登录失败
  - 验证错误密码处理

- **`test_login_nonexistent_user`**: 测试不存在的用户登录失败
  - 验证用户不存在时的错误处理

#### 3. 用户资料管理 (`UserProfileTestCase`)

- **`test_get_profile`**: 测试获取用户资料
  - 验证需要认证
  - 验证返回的用户信息

- **`test_update_profile`**: 测试更新用户资料
  - 验证资料更新功能

- **`test_profile_requires_authentication`**: 测试未认证用户无法访问资料
  - 验证权限控制

#### 4. 用户模型测试 (`UserModelTestCase`)

- **`test_create_user`**: 测试创建用户模型
  - 验证用户创建流程
  - 验证关联的 UserProfile 创建

- **`test_user_full_name`**: 测试用户全名属性
  - 验证 `get_full_name()` 方法

- **`test_user_str_method`**: 测试用户字符串表示
  - 验证 `__str__()` 方法

- **`test_get_volunteer_level`**: 测试志愿者等级计算
  - 基于志愿者积分计算等级

- **`test_update_impact_score`**: 测试影响分数更新
  - 验证志愿者积分更新逻辑

#### 5. 用户登出功能 (`UserLogoutTestCase`)

- **`test_logout_success`**: 测试登出成功
  - 验证 token 删除

#### 6. 密码修改功能 (`PasswordChangeTestCase`)

- **`test_change_password_success`**: 测试密码修改成功
  - 验证密码修改流程

- **`test_change_password_wrong_old_password`**: 测试旧密码错误
  - 验证旧密码验证逻辑

- **`test_change_password_mismatch`**: 测试新密码不匹配
  - 验证新密码确认逻辑

#### 7. 用户头像功能 (`UserAvatarTestCase`)

- **`test_upload_avatar_no_file`**: 测试上传头像但没有文件
  - 验证错误处理

- **`test_remove_avatar_success`**: 测试删除头像成功
  - 验证头像删除功能

#### 8. 用户统计功能 (`UserStatsTestCase`)

- **`test_get_user_stats`**: 测试获取用户统计信息
  - 验证统计信息返回

- **`test_user_stats_requires_authentication`**: 测试统计信息需要认证
  - 验证权限控制

#### 9. 用户成就功能 (`UserAchievementsTestCase`)

- **`test_list_achievements`**: 测试列出用户成就
  - 验证成就列表返回

#### 10. 用户活动功能 (`UserActivitiesTestCase`)

- **`test_list_user_activities`**: 测试列出用户参与的活动
  - 验证活动列表返回

#### 11. 用户通知功能 (`UserNotificationsTestCase`)

- **`test_list_notifications`**: 测试列出用户通知
  - 验证通知列表返回

- **`test_mark_notification_read`**: 测试标记通知为已读
  - 验证通知状态更新

- **`test_mark_all_notifications_read`**: 测试标记所有通知为已读
  - 验证批量更新功能

- **`test_mark_notification_read_not_found`**: 测试标记不存在的通知
  - 验证错误处理

#### 12. 全局统计功能 (`GlobalStatsTestCase`)

- **`test_get_global_stats`**: 测试获取全局统计信息
  - 验证全局统计数据

#### 13. 用户搜索功能 (`SearchUsersTestCase`, `SearchUsersExtendedTestCase`)

- **`test_search_users`**: 测试搜索用户
  - 验证搜索功能

- **`test_search_users_by_role`**: 测试按角色搜索用户
  - 验证角色过滤

- **`test_search_users_by_location`**: 测试按位置搜索用户
  - 验证位置过滤

- **`test_search_users_combined_filters`**: 测试组合过滤条件搜索
  - 验证多条件搜索

- **`test_search_users_excludes_current_user`**: 测试搜索排除当前用户
  - 验证搜索逻辑

#### 14. 健康检查 (`HealthCheckTestCase`)

- **`test_health_check`**: 测试健康检查接口
  - 验证服务健康状态

#### 15. 创建通知功能 (`CreateNotificationTestCase`)

- **`test_create_notification_success`**: 测试创建通知成功
  - 验证通知创建流程

- **`test_create_notification_with_activity_id`**: 测试创建带活动ID的通知
  - 验证关联活动通知

- **`test_create_notification_missing_required_fields`**: 测试缺少必填字段
  - 验证表单验证

- **`test_create_notification_user_not_found`**: 测试用户不存在
  - 验证错误处理

---

### 活动服务测试 (`services/activity/activities/tests.py`)

#### 1. 活动分类模型测试 (`ActivityCategoryTestCase`, `ActivityCategoryExtendedTestCase`)

- **`test_create_category`**: 测试创建分类
  - 验证分类创建流程

- **`test_category_str`**: 测试分类字符串表示
  - 验证 `__str__()` 方法

- **`test_category_is_active_default`**: 测试分类默认激活状态
  - 验证默认值

- **`test_category_color_default`**: 测试分类默认颜色
  - 验证默认颜色值

- **`test_category_is_active`**: 测试分类激活状态属性
- **`test_category_color`**: 测试分类颜色属性

#### 2. 活动模型测试 (`ActivityModelTestCase`, `ActivityModelPropertiesTestCase`)

- **`test_create_activity`**: 测试创建活动
  - 验证活动创建流程
  - 验证参与者计数

- **`test_activity_participants_count`**: 测试活动参与者计数
  - 验证 `get_participants_count()` 方法

- **`test_activity_str_method`**: 测试活动字符串表示
  - 验证 `__str__()` 方法

- **`test_activity_properties`**: 测试活动属性
  - 验证各种属性计算

- **`test_activity_status_default`**: 测试活动状态默认值
- **`test_activity_is_featured_default`**: 测试活动是否精选默认值

#### 3. 活动模型方法测试 (`ActivityModelMethodsTestCase`)

- **`test_activity_is_full`**: 测试活动是否已满
  - 验证 `is_full()` 方法

- **`test_activity_get_available_spots`**: 测试获取可用名额
  - 验证 `get_available_spots()` 方法

- **`test_activity_is_past`**: 测试活动是否已结束
  - 验证 `is_past()` 方法

- **`test_activity_is_upcoming`**: 测试活动是否即将开始
  - 验证 `is_upcoming()` 方法

- **`test_activity_is_ongoing`**: 测试活动是否正在进行
  - 验证 `is_ongoing()` 方法

- **`test_activity_registration_open`**: 测试活动注册是否开放
  - 验证 `registration_open()` 方法

#### 4. 活动注册截止日期测试 (`ActivityRegistrationDeadlineTestCase`)

- **`test_registration_open_with_deadline`**: 测试有截止日期的注册开放
- **`test_registration_closed_after_deadline`**: 测试截止日期后注册关闭

#### 5. 活动参与者计数测试 (`ActivityParticipantCountTestCase`)

- **`test_participants_count_includes_multiple_statuses`**: 测试参与者计数包含多种状态
- **`test_get_available_spots_with_participants`**: 测试有参与者时的可用名额
- **`test_get_available_spots_zero`**: 测试可用名额为零

#### 6. 活动API测试 (`ActivityAPITestCase`)

- **`test_list_approved_activities`**: 测试列出已审批的活动
  - 验证活动列表API
  - 验证只返回已审批活动

- **`test_get_activity_detail`**: 测试获取活动详情
  - 验证活动详情API

- **`test_filter_activities_by_category`**: 测试按分类过滤活动
  - 验证过滤功能

#### 7. 活动创建测试 (`ActivityCreateTestCase`, `ActivityCreateSerializerTestCase`)

- **`test_create_activity_requires_authentication`**: 测试创建活动需要认证
  - 验证权限控制

- **`test_create_activity_missing_required_fields`**: 测试缺少必填字段
  - 验证表单验证

- **`test_create_activity_with_images`**: 测试创建活动时上传图片
  - 验证图片上传功能
  - 验证图片保存

- **`test_create_activity_without_authentication`**: 测试未认证用户无法创建活动
  - 验证序列化器认证检查

#### 8. 活动更新测试 (`ActivityUpdateTestCase`)

- **`test_update_activity_detail_requires_authentication`**: 测试更新活动需要认证
  - 验证权限控制

#### 9. 活动参与者测试 (`ActivityParticipantTestCase`, `ActivityParticipantViewSetTestCase`)

- **`test_list_participants_requires_authentication`**: 测试列出参与者需要认证
  - 验证权限控制

- **`test_apply_for_activity_requires_authentication`**: 测试申请参与活动需要认证
  - 验证权限控制

- **`test_create_participant_application`**: 测试创建参与者申请
  - 验证申请流程

- **`test_create_duplicate_application`**: 测试重复申请
  - 验证重复申请处理

- **`test_update_participant_status_as_organizer`**: 测试组织者更新参与者状态
  - 验证状态更新权限

- **`test_update_participant_status_as_volunteer`**: 测试志愿者更新参与者状态
  - 验证权限限制

- **`test_list_participants`**: 测试列出参与者
  - 验证参与者列表
  - 验证权限过滤

#### 10. 活动参与者模型测试 (`ActivityParticipantModelTestCase`, `ActivityParticipantFieldsTestCase`)

- **`test_create_participant`**: 测试创建参与者
  - 验证参与者创建

- **`test_participant_str_method`**: 测试参与者字符串表示
  - 验证 `__str__()` 方法

- **`test_participant_experience_level`**: 测试参与者经验等级
- **`test_participant_hours_volunteered`**: 测试参与者志愿服务时长
- **`test_participant_rating`**: 测试参与者评分

#### 11. 活动参与者审批测试 (`ActivityParticipantApprovalTestCase`)

- **`test_participant_status_transitions`**: 测试参与者状态转换
  - 验证状态流转逻辑

#### 12. 活动过滤测试 (`ActivityFilterTestCase`)

- **`test_filter_by_category`**: 测试按分类过滤
- **`test_filter_by_status`**: 测试按状态过滤
- **`test_filter_by_organizer`**: 测试按组织者过滤
- **`test_search_activities`**: 测试搜索活动
- **`test_order_activities`**: 测试活动排序

#### 13. 活动查询集测试 (`ActivityGetQuerysetTestCase`, `ActivityViewSetQuerysetTestCase`)

- **`test_anonymous_user_only_sees_approved`**: 测试匿名用户只能看到已审批活动
- **`test_volunteer_can_only_see_approved`**: 测试志愿者只能看到已审批活动
- **`test_organizer_can_see_own_and_approved`**: 测试组织者可以看到自己的和已审批的活动
- **`test_admin_can_see_all`**: 测试管理员可以看到所有活动

#### 14. 活动权限测试 (`ActivityPermissionTestCase`)

- **`test_anonymous_user_can_view_approved_activity`**: 测试匿名用户可以查看已审批活动
- **`test_anonymous_user_cannot_view_pending_activity`**: 测试匿名用户不能查看待审批活动
- **`test_authenticated_user_permissions`**: 测试认证用户权限
- **`test_has_object_permission`**: 测试对象级权限

#### 15. 活动审批测试 (`ActivityViewSetApproveTestCase`, `AdminActivityApprovalViewSetTestCase`)

- **`test_approve_activity_as_admin`**: 测试管理员审批活动
  - 验证审批流程
  - 验证通知发送

- **`test_reject_activity_as_admin`**: 测试管理员拒绝活动
  - 验证拒绝流程

- **`test_approve_activity_as_non_admin`**: 测试非管理员无法审批活动
  - 验证权限控制

- **`test_admin_update_activity_approval`**: 测试管理员更新活动审批状态
- **`test_non_admin_cannot_update_approval`**: 测试非管理员无法更新审批状态

#### 16. 活动统计测试 (`ActivityStatsTestCase`, `ActivityStatsExtendedTestCase`)

- **`test_get_activity_stats`**: 测试获取活动统计信息
  - 验证统计信息返回

- **`test_get_activity_stats_with_hours`**: 测试获取包含时长的活动统计
  - 验证总时长计算

#### 17. 活动分类API测试 (`ActivityCategoryAPITestCase`)

- **`test_list_categories`**: 测试列出活动分类
  - 验证分类列表API

#### 18. 活动评论测试 (`ActivityReviewTestCase`, `ActivityReviewModelTestCase`)

- **`test_list_activity_reviews`**: 测试列出活动评论
  - 验证评论列表

- **`test_create_review`**: 测试创建评论
  - 验证评论创建

- **`test_review_str_method`**: 测试评论字符串表示

#### 19. 活动标签测试 (`ActivityTagModelTestCase`, `ActivityTagMappingTestCase`)

- **`test_create_tag`**: 测试创建标签
- **`test_tag_is_active_default`**: 测试标签默认激活状态
- **`test_create_tag_mapping`**: 测试创建标签映射

#### 20. 活动点赞和分享测试 (`ActivityLikeModelTestCase`, `ActivitySharesCountTestCase`)

- **`test_create_like`**: 测试创建点赞
- **`test_likes_count_default`**: 测试点赞数默认值
- **`test_likes_count_increment`**: 测试点赞数递增
- **`test_shares_count_default`**: 测试分享数默认值
- **`test_shares_count_increment`**: 测试分享数递增

#### 21. 活动浏览量测试 (`ActivityViewsCountTestCase`)

- **`test_views_count_default`**: 测试浏览量默认值
- **`test_views_count_increment`**: 测试浏览量递增

#### 22. 活动序列化器测试 (`ActivitySerializerTestCase`)

- **`test_activity_serializer_with_request`**: 测试序列化器在有request上下文时生成完整URL
- **`test_activity_serializer_without_request`**: 测试序列化器在没有request上下文时使用默认URL
- **`test_activity_serializer_empty_images`**: 测试序列化器处理空图片列表
- **`test_activity_serializer_get_images_with_request`**: 测试序列化器获取图片URL（有request）
- **`test_activity_serializer_get_images_without_request`**: 测试序列化器获取图片URL（无request）
- **`test_activity_serializer_get_images_empty`**: 测试序列化器获取空图片列表
- **`test_activity_serializer_get_participants_count`**: 测试序列化器获取参与者数量
- **`test_activity_serializer_get_available_spots`**: 测试序列化器获取可用名额

#### 23. 活动状态更新序列化器测试 (`ActivityStatusUpdateSerializerTestCase`)

- **`test_validate_status_allowed`**: 测试允许的状态值
- **`test_validate_status_not_allowed`**: 测试不允许的状态值

#### 24. 健康检查 (`ActivityHealthCheckTestCase`)

- **`test_health_check`**: 测试健康检查接口
  - 验证服务健康状态

---

### 通知服务测试 (`services/notification/notification_service/tests.py`)

#### 1. 通知模型测试 (`NotificationModelTestCase`, `NotificationModelExtendedTestCase`)

- **`test_create_notification`**: 测试创建通知
  - 验证通知创建流程
  - 验证默认值

- **`test_notification_str_method`**: 测试通知字符串表示
  - 验证 `__str__()` 方法

- **`test_mark_as_read`**: 测试标记通知为已读
  - 验证 `mark_as_read()` 方法
  - 验证 `read_at` 时间戳

- **`test_mark_as_sent`**: 测试标记通知为已发送
  - 验证 `mark_as_sent()` 方法
  - 验证 `sent_at` 时间戳

- **`test_notification_priority`**: 测试通知优先级
- **`test_notification_with_activity_id`**: 测试带活动ID的通知
- **`test_notification_created_at`**: 测试通知创建时间

#### 2. 通知API测试 (`NotificationAPITestCase`)

- **`test_list_notifications`**: 测试列出通知
  - 验证通知列表API
  - 验证分页

- **`test_create_notification`**: 测试创建通知
  - 验证通知创建API
  - 验证 Celery 任务触发（已mock）

- **`test_get_notification_detail`**: 测试获取通知详情
  - 验证通知详情API

- **`test_mark_notification_read`**: 测试标记通知为已读
  - 验证状态更新API

- **`test_filter_notifications_by_type`**: 测试按类型过滤通知
  - 验证过滤功能

- **`test_filter_unread_notifications`**: 测试过滤未读通知
  - 验证未读过滤

- **`test_delete_notification`**: 测试删除通知
  - 验证删除功能

---

## 前端单元测试

### API 服务测试 (`frontend/src/test/services/api.test.ts`)

#### 1. 用户API测试 (`userAPI`)

- **`应该能够调用登录API`**: 测试用户登录API调用
  - 验证登录请求发送
  - 验证响应处理

- **`应该能够调用注册API`**: 测试用户注册API调用
  - 验证注册请求发送
  - 验证响应处理

- **`应该能够调用获取用户信息API`**: 测试获取用户信息API调用
  - 验证用户信息请求
  - 验证响应处理

#### 2. 活动API测试 (`activityAPI`)

- **`应该能够调用获取活动列表API`**: 测试获取活动列表API调用
  - 验证活动列表请求

- **`应该能够调用获取活动详情API`**: 测试获取活动详情API调用
  - 验证活动详情请求

- **`应该能够调用创建活动API`**: 测试创建活动API调用
  - 验证活动创建请求

#### 3. 通知API测试 (`notificationAPI`)

- **`应该能够调用获取通知列表API`**: 测试获取通知列表API调用
  - 验证通知列表请求
  - 验证 localStorage 使用

- **`应该能够调用标记通知为已读API`**: 测试标记通知为已读API调用
  - 验证状态更新请求

### 组件测试

#### 1. 受保护路由组件 (`frontend/src/test/components/ProtectedRoute.test.tsx`)

- **`应该显示加载状态当loading为true`**: 测试加载状态显示
  - 验证加载状态UI

- **`应该重定向到登录页当用户未认证`**: 测试未认证用户重定向
  - 验证路由保护逻辑

- **`应该显示内容当用户已认证且无角色要求`**: 测试认证用户访问
  - 验证权限控制

- **`应该显示403错误当用户角色不匹配`**: 测试角色权限检查
  - 验证角色限制

- **`应该显示内容当用户角色匹配`**: 测试角色匹配时允许访问
  - 验证角色验证逻辑

#### 2. 语言切换器组件 (`frontend/src/test/components/LanguageSwitcher.test.tsx`)

- **`应该渲染语言切换器`**: 测试语言切换器渲染
  - 验证组件显示
  - 验证默认语言（English）

- **`应该显示中文当语言为zh`**: 测试中文语言显示
  - 验证语言切换功能

#### 3. 首页组件 (`frontend/src/test/pages/HomePage.test.tsx`)

- **`应该渲染首页`**: 测试首页渲染
  - 验证页面加载
  - 验证无错误抛出

### 上下文测试

#### 1. 认证上下文 (`frontend/src/test/contexts/AuthContext.test.tsx`)

- **`应该提供认证上下文`**: 测试认证上下文提供
  - 验证上下文属性
  - 验证 `isAuthenticated`, `user`, `login`, `logout` 方法

---

## 集成测试

### Postman API 集成测试 (`tests/postman_collection.json`)

使用 Newman 运行 Postman 集合，测试 API 集成：

- **User Service Health**: 测试用户服务健康检查
  - 验证服务可用性
  - 验证 HTTP 状态码 200

- **Activity Service Health**: 测试活动服务健康检查
  - 验证服务可用性
  - 验证 HTTP 状态码 200

- **Notification Service Health**: 测试通知服务健康检查
  - 验证服务可用性
  - 验证 HTTP 状态码 200

---

## 端到端测试

### Playwright E2E 测试 (`frontend/tests/e2e.spec.ts`)

- **`frontend health page returns 200`**: 测试前端健康检查页面
  - 验证健康检查端点返回 200 状态码
  - 验证服务可用性

- **`home page renders`**: 测试首页渲染
  - 验证页面标题包含 "Volunteer"、"志愿者" 或 "Vite"
  - 验证页面基本加载

---

## 性能测试

### k6 负载测试 (`tests/perf/k6-load.js`)

- **测试场景**: 渐进式负载测试
  - 阶段1: 2分钟内逐步增加到200并发用户
  - 阶段2: 5分钟内逐步增加到500并发用户
  - 阶段3: 3分钟内逐步减少到0并发用户

- **性能指标**:
  - HTTP 请求失败率 < 0.5%
  - 95% 的请求响应时间 < 200ms

- **测试端点**: Activity Service 活动列表 API (`/api/v1/activities/`)

### JMeter 性能测试 (`tests/perf/jmeter_test.jmx`)

- **测试场景**: 高并发负载测试
  - 线程数: 300 并发用户
  - 启动时间: 60秒
  - 持续时间: 600秒（10分钟）

- **测试端点**: Activity Service 健康检查 API (`/api/v1/health/`)

- **测试目的**: 验证系统在高负载下的稳定性和性能表现

---

## 安全测试

### SAST (静态应用安全测试)

#### 1. Gitleaks - 密钥泄露检测
- **功能**: 扫描 Git 仓库中的密钥、密码、API 密钥等敏感信息泄露
- **输出**: SARIF 格式报告和 HTML 报告

#### 2. Bandit - Python 安全扫描
- **功能**: 扫描 Python 代码中的安全漏洞
- **检测内容**: SQL 注入、命令注入、硬编码密码等
- **输出**: SARIF 格式报告和 HTML 报告

#### 3. Semgrep - 通用代码安全扫描
- **功能**: 扫描多种编程语言的代码安全问题
- **检测内容**: 常见漏洞模式、不安全实践
- **输出**: SARIF 格式报告和 HTML 报告

#### 4. pip-audit - 依赖漏洞扫描
- **功能**: 扫描 Python 依赖包中的已知安全漏洞
- **检测服务**: User Service、Activity Service、Notification Service
- **输出**: SARIF 格式报告和 HTML 报告

### DAST (动态应用安全测试)

#### OWASP ZAP Baseline Scan
- **功能**: 对运行中的应用进行安全扫描
- **检测内容**: 
  - 跨站脚本攻击 (XSS)
  - SQL 注入
  - 不安全的配置
  - 敏感信息泄露
- **输出**: HTML、JSON、Markdown 格式报告

### 容器和 IaC 扫描

#### 1. Trivy - 容器镜像扫描
- **功能**: 扫描 Docker 镜像中的安全漏洞
- **扫描镜像**: 
  - User Service
  - Activity Service
  - Notification Service
  - Frontend
- **输出**: JSON 和 HTML 格式报告

#### 2. Checkov - 基础设施即代码扫描
- **功能**: 扫描 Dockerfile 和 Kubernetes 配置中的安全问题
- **检测内容**:
  - Dockerfile 最佳实践
  - Kubernetes 配置安全
- **输出**: CLI 格式文本报告

---

## 测试覆盖率

### 后端服务覆盖率

- **User Service**: 覆盖用户注册、登录、资料管理、统计等功能
- **Activity Service**: 覆盖活动创建、审批、参与者管理、统计等功能
- **Notification Service**: 覆盖通知创建、查询、状态更新等功能

### 前端覆盖率

- **API 服务**: 覆盖所有 API 调用方法
- **组件**: 覆盖核心组件（ProtectedRoute、LanguageSwitcher）
- **页面**: 覆盖主要页面（HomePage）
- **上下文**: 覆盖认证上下文

### 覆盖率目标

- **目标覆盖率**: ≥ 85%
- **当前策略**: 覆盖率不足时发出警告，但不阻止 CI 通过

---

## 测试执行

### CI/CD 中的测试流程

1. **SAST 扫描** (Pull Request)
   - Gitleaks、Bandit、Semgrep、pip-audit

2. **单元测试** (依赖 SAST)
   - 后端服务单元测试（带覆盖率）
   - 前端单元测试（带覆盖率）
   - 前端构建测试

3. **集成测试** (依赖 单元测试)
   - Docker Compose 启动服务
   - Postman API 集成测试
   - Playwright E2E 测试

4. **容器和 IaC 扫描** (依赖 单元测试)
   - Trivy 镜像扫描
   - Checkov 配置扫描

5. **DAST 扫描** (依赖 集成测试)
   - OWASP ZAP Baseline Scan

6. **性能测试** (依赖 集成测试)
   - k6 负载测试
   - JMeter 性能测试

### 本地运行测试

#### 后端测试
```bash
# User Service
cd services/user
python manage.py test users.tests --settings=user_service.settings.base

# Activity Service
cd services/activity
python manage.py test activities.tests --settings=activity_service.settings.base

# Notification Service
cd services/notification
python manage.py test notification_service.tests --settings=notification_service.settings
```

#### 前端测试
```bash
# 单元测试
cd frontend
npm run test:unit

# 单元测试（带覆盖率）
npm run test:unit:coverage

# E2E 测试
npm test
```

#### 集成测试
```bash
# 启动测试环境
docker compose -f docker-compose.test.yml up -d --build

# 运行 Postman 测试
newman run tests/postman_collection.json --environment tests/postman_env.json
```

#### 性能测试
```bash
# k6 负载测试
k6 run tests/perf/k6-load.js

# JMeter 性能测试
jmeter -n -t tests/perf/jmeter_test.jmx -l jmeter.jtl -e -o jmeter-report
```

---

## 测试报告

所有测试报告会在 CI/CD 运行后上传为 GitHub Actions Artifacts，可在 Actions 页面下载查看。

### 单元测试报告

**GitHub Actions Artifact 名称**: `coverage_reports`

- **后端**: 
  - XML 格式覆盖率报告：`coverage-user.xml`, `coverage-activity.xml`, `coverage-notification.xml`
  - HTML 详细报告：`coverage-user-html/`, `coverage-activity-html/`, `coverage-notification-html/`
- **前端**: 
  - JSON、HTML、LCOV 格式覆盖率报告：`frontend/coverage/`
- **汇总报告**: 
  - `coverage-summary.html` - 所有服务的覆盖率汇总报告

### 集成测试报告

**GitHub Actions Artifact 名称**: `integration_artifacts`

- **Postman**: HTML 格式测试报告 - `newman-report.html`
- **Playwright**: HTML 格式测试报告，包含截图和视频 - `frontend/playwright-report/`

### 性能测试报告

**GitHub Actions Artifact 名称**: 
- `perf_results_k6` - k6 性能测试结果
- `perf_results_jmeter` - JMeter 性能测试结果

#### k6 性能测试报告 (`perf_results_k6`)
- **JSON 格式**: `k6-results.json`, `k6-summary.json`
- **HTML 格式**: `k6-summary.html` - 性能测试汇总报告

#### JMeter 性能测试报告 (`perf_results_jmeter`)
- **JTL 格式**: `jmeter.jtl` - 原始测试数据
- **HTML 格式**: 
  - `jmeter-summary.html` - 性能测试汇总报告
  - `jmeter-report/` - 详细 HTML 报告目录

### 安全扫描报告

#### SAST 安全扫描报告

**GitHub Actions Artifact 名称**: `sast_reports`

- **SARIF 格式**: 
  - `gitleaks.sarif` - Gitleaks 密钥泄露检测
  - `bandit.sarif` - Bandit Python 安全扫描
  - `semgrep.sarif` - Semgrep 通用代码安全扫描
  - `pip-audit-user.sarif` - User Service 依赖漏洞
  - `pip-audit-activity.sarif` - Activity Service 依赖漏洞
  - `pip-audit-notification.sarif` - Notification Service 依赖漏洞
- **HTML 格式**: 
  - `gitleaks.html`, `bandit.html`, `semgrep.html`, `pip-audit-*.html` - 各工具详细报告
  - `sast-summary.html` - SAST 扫描汇总报告

#### DAST 安全扫描报告

**GitHub Actions Artifact 名称**: `zapReport`

- **HTML 格式**: `report_html.html` - ZAP 完整 HTML 报告
- **JSON 格式**: `report_json.json` - ZAP JSON 数据
- **Markdown 格式**: `report_md.md` - ZAP Markdown 报告
- **汇总报告**: `zap-summary.html` - ZAP 扫描汇总报告

#### 容器和 IaC 扫描报告

**GitHub Actions Artifact 名称**: `container_iac_scan_results`

- **Trivy 扫描结果**:
  - JSON 格式：`trivy-user-image.json`, `trivy-activity-image.json`, `trivy-notification-image.json`, `trivy-*-dockerfile.json`
  - HTML 格式：`trivy-*.html` - 各镜像和 Dockerfile 的详细扫描报告
- **Checkov 扫描结果**:
  - 文本格式：`checkov-dockerfile.txt`, `checkov-k8s.txt` - Dockerfile 和 Kubernetes 配置扫描结果

### 如何查看测试报告

1. **在 GitHub Actions 页面查看**:
   - 进入仓库的 Actions 标签页
   - 选择对应的 workflow run
   - 在页面底部的 Artifacts 区域下载对应的 artifact

2. **使用 GitHub CLI 下载**:
   ```bash
   # 列出所有 artifacts
   gh run list
   
   # 下载特定 artifact
   gh run download <run-id> -n <artifact-name>
   ```

3. **报告查看方式**:
   - **HTML 报告**: 下载后直接在浏览器中打开 `*.html` 文件
   - **SARIF 报告**: 可以使用 VS Code 的 SARIF Viewer 扩展查看，或上传到 GitHub Code Scanning
   - **JSON 报告**: 使用文本编辑器或 JSON 查看器查看
   - **文本报告**: 使用文本编辑器查看

---

## 测试最佳实践

1. **测试独立性**: 每个测试应该独立运行，不依赖其他测试
2. **测试数据**: 使用测试数据库，避免影响生产数据
3. **Mock 外部依赖**: 使用 Mock 避免依赖外部服务
4. **覆盖边界情况**: 测试正常流程和异常情况
5. **性能测试**: 定期进行性能测试，确保系统性能
6. **安全测试**: 持续进行安全扫描，及时发现漏洞
7. **测试维护**: 保持测试代码与业务代码同步更新

---

## 总结

本项目的测试策略全面覆盖了：

- ✅ **功能测试**: 单元测试、集成测试、E2E 测试
- ✅ **性能测试**: k6 和 JMeter 负载测试
- ✅ **安全测试**: SAST、DAST、容器扫描
- ✅ **代码质量**: 覆盖率监控、静态分析

通过多层次的测试，确保系统的**可靠性**、**性能**和**安全性**。

