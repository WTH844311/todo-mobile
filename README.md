# DEBUG
## RUN
```
    $ react-native run-android
```


# RELEASE
## BUNDLE
```
    $ react-native bundle --platform android --dev false --reset-cache --entry-file index.js --bundle-output android/app/build/generated/assets/react/release/index.android.bundle --assets-dest android/app/build/generated/res/react/release

```

## BUILD APK
```
    $ cd android
    $ ./gradlew assembleRelease
```

## INSTALL APK TO DEVICE
```
    $ cd android
    $ ./gradlew installRelease
```

## CLEAN FILE BEFORE REBUNDLE
```
    $ cd android
    $ ./gradlew clean
```

# 其他问题
1. DEBUG 和 RELEASE 版本切换造成的签名不一致
    卸载 DEBUG 版本的 app
    或
    在 cmd 运行 adb uninstall "你的包名（todomobile）"