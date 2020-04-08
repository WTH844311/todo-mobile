import React, { Component, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider, observer } from 'mobx-react'
import AsyncStorage from '@react-native-community/async-storage'
import Store from './src/stores/index'
import State from './src/stores/state'
import Lists from './src/pages/lists/index'
import Search from './src/pages/search/index'
import Tasks from './src/pages/tasks/index'
import TaskDetails from './src/pages/taskDetails/index'
import Login from './src/pages/login/index'
import Register from './src/pages/register/index'
import util from './src/common/util'
import theme from './src/common/theme'
import TaskOptionSheet from './src/components/actionSheet/taskOptions/index'
import TaskShareSheet from './src/components/actionSheet/taskShareFirst/index'
import SettingSheet from './src/components/actionSheet/settings/index'
import { navigationRef } from './src/common/navigation'
import NotifiService from './src/common/myNotifService'

const Stack = createStackNavigator();
let taskOptionSheet = null,
    taskShareFirstSheet = null,
    settingSheet = null

const ListTitle = () => {
  const [username, setUsername] = useState(null)
  AsyncStorage.getItem('user').then(u => {
    if (u) setUsername(JSON.parse(u).username)
  })
  return (
    <View style={styles.listTitle}>
      <TouchableOpacity onPress={() => settingSheet.show()}>
        <Text style={styles.title}>{username}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={State.changeShowSearch}>
        {util.getIcon({
          icon: 'search1',
          iconFrom: 'AntDesign',
          size: 24,
          color: '#2474bb'
        })}
      </TouchableOpacity>
    </View>
  );
}

const TaskTitle = ({ store }) => {
  const members = store.currentList.members
  return (
    <View style={styles.taskTitle}>
      <Text style={styles.title}></Text>
      <View style={[styles.options]}>
        {store.currentList && !store.currentList.defaultList && (
          <TouchableOpacity style={styles.shareOption} onPress={() => taskShareFirstSheet.show()}>
            {util.getIcon({
              icon: 'adduser',
              iconFrom: 'AntDesign',
              color: 'white',
              style: { marginRight: 5 }
            })}
            {members && members.length > 0 && <Text style={{color: 'white'}}>{members.length+1}</Text>}
            
          </TouchableOpacity>
        )}
        <TouchableOpacity style={{ padding: 10 }} onPress={() => taskOptionSheet.show()}>
          {util.getIcon({
            icon: 'ellipsis-h',
            iconFrom: 'FontAwesome5',
            size: 15,
            color: 'white'
          })}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DetailTitle = () => {
  return (
    <View style={styles.logoTitle}>
      <Text style={styles.taskTitle}></Text>
    </View>
  )
}

class App extends Component {

  constructor(props) {
    super(props)
    this.notif = new NotifiService(this.onRegister, this.onNotif)
  }

  componentDidMount() {
    // 系统通知定时器
    this.notifTimer = setInterval(() => {
      Store.tasks.filter(t => !t.completed && t.reminder?.date).map(t => {
        const time = new Date(t.reminder.date).getTime() - Date.now()
        if (time < 60 * 1000 && time > 0) {
          this.showNotify({
            title: '提醒',
            message: t.title,
            subText: '通知',
            bigText: t.title
          })
        }
      })
    }, 60 * 1000)
  }

  componentWillUnmount() {
    clearInterval(this.notifTimer)
    this.notif = null
  }

  showNotify = content => {
    this.notif.localNotifTitle(content)
  }

  onRegister = token => {
    console.log(token)
  }

  onNotif = notif => {
    console.log(notif)
  }

  render() {
    return (
      <Provider store={Store} state={State}>
        <NavigationContainer ref={navigationRef}>
          <TaskOptionSheet ref={ref => taskOptionSheet = ref} />
          <TaskShareSheet ref={ref => taskShareFirstSheet = ref} />
          <SettingSheet ref={ref => settingSheet = ref} />
          <Stack.Navigator initialRouteName='lists'>
            <Stack.Screen
              name="lists"
              component={State.showSearch ? Search : Lists}
              options={{
                headerShown: !State.showSearch,
                headerTitle: props => <ListTitle {...props} />,
                headerStyle: {
                  elevation: 0, // remove shadow on Android
                  shadowOpacity: 0, // remove shadow on iOS
                }
              }}
            />
            <Stack.Screen
              name="tasks"
              component={Tasks}
              options={{
                headerTitle: props => <TaskTitle {...props} store={Store} />,
                headerTintColor: 'white',
                headerStyle: {
                  backgroundColor: (Store && Store.currentList !== null) ? (theme[Store.currentList.theme] || theme.grey):theme.grey,
                  elevation: 0, // remove shadow on Android
                  shadowOpacity: 0, // remove shadow on iOS
                },
              }}
            />
            <Stack.Screen
              name="details"
              component={TaskDetails}
              options={{
                headerTitle: props => <DetailTitle {...props} />,
                headerStyle: {
                  elevation: 0, // remove shadow on Android
                  shadowOpacity: 0, // remove shadow on iOS
                },
              }}
            />
            <Stack.Screen name="login" component={Login} />
            <Stack.Screen name="register" component={Register} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }
}

const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
  listTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: windowWidth * .92,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black'
  },
  taskTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: windowWidth * .76,
  },
  options: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto'
  },
  shareOption: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  }
});

export default observer(App);
