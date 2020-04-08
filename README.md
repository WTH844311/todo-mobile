# 基于 React-Native 的仿 Microsoft To-Do 移动端 app



## 所用技术栈

1. react-native v0.61.5 
2. realm v3.6.4
3. mobx v5.15.4


## UI 界面

<div style="display: flex; flex-directory: row">
<p><a href="https://github.com/WTH844311/todo-mobile"><img width="30%" src="https://github.com/WTH844311/todo-mobile/raw/master/doc/images/lists.png" alt="todo-mobile UI"></a></p>
<p><a href="https://github.com/WTH844311/todo-mobile"><img width="30%" src="https://github.com/WTH844311/todo-mobile/raw/master/doc/images/tasks.png" alt="todo-mobile UI"></a></p>
<p><a href="https://github.com/WTH844311/todo-mobile"><img width="30%" src="https://github.com/WTH844311/todo-mobile/raw/master/doc/images/taskDetail.png" alt="todo-mobile UI"></a></p>
<div>


## 调试

确保电脑与设备建立连接或模拟器处于可用状态
```
    $ react-native run-android
```

## 发布（安卓）
### 打包
```
    $ react-native bundle --platform android --dev false --reset-cache --entry-file index.js --bundle-output android/app/build/generated/assets/react/release/index.android.bundle --assets-dest android/app/build/generated/res/react/release

```

### 生成 APK

```
    $ cd android
    $ ./gradlew assembleRelease
```

### 安装应用到设备或模拟器

```
    $ cd android
    $ ./gradlew installRelease
```

### 重新打包前清楚缓存

```
    $ cd android
    $ ./gradlew clean
```

## 其他问题

1. DEBUG 和 RELEASE 版本切换造成的签名不一致
    卸载 DEBUG 版本的 app
    或
    在 cmd 运行 adb uninstall "你的包名（todomobile）"
