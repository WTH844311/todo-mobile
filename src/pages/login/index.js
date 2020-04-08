import React, { Component } from 'react'
import { View, Text, StyleSheet, TextInput, Alert, Button } from 'react-native'
import { inject, observer } from 'mobx-react'
import { serverDomain } from '../../common/config'
import AsyncStorage from '@react-native-community/async-storage'
import ActionSheet from '../../components/actionSheet'

class Login extends Component {

  state = {
    accountValueInput: false,
    accountValidationMsg: null,
    passwordValueInput: false,
    passwordValidationMsg: null,
    showModal: false
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.accountValueInput !== this.state.accountValueInput) {
      if (!this.state.accountValueInput) {
        this.setState({ accountValidationMsg: '该项不能为空' })
      } else {
        this.setState({ accountValidationMsg: null })
      }
    }
    if (prevState.passwordValueInput !== this.state.passwordValueInput) {
      if (!this.state.passwordValueInput) {
        this.setState({ passwordValidationMsg: '该项不能为空' })
      } else {
        this.setState({ passwordValidationMsg: null })
      }
    }
  }

  submit = async () => {
    const { accountValueInput, passwordValueInput } = this.state
    if (!accountValueInput) this.setState({ accountValidationMsg: '该项不能为空' })
    if (!passwordValueInput) this.setState({ passwordValidationMsg: '该项不能为空' })
    if (!accountValueInput || !passwordValueInput) return
    
    try {
      const res = await fetch(`${serverDomain}user/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          account: accountValueInput,
          password: passwordValueInput
        })
      })
      const { code, msg, data } = await res.json()
      if (code === 1) {
        await AsyncStorage.setItem('token', data.token)
        const user = {
          user_id: data.user_id,
          username: data.username
        }
        await AsyncStorage.setItem('user', JSON.stringify(user))
        this.props.store.initWs()
        this.props.store.getUsers()
        this.props.navigation.navigate('lists')
      } else {
        Alert.alert(
          '登录失败',
          msg,
          [
            {text: '知道了', onPress: () => console.log('OK Pressed')}
          ]
        )
      }
    } catch (error) {
      console.log('submit error:' + error)
    }
  }

  render() {
    const { accountValidationMsg, passwordValidationMsg } = this.state
    return (
      <View style={styles.background}>
        <View style={styles.account}>
          <TextInput
            style={styles.textInput}
            placeholder="用户名或邮箱"
            onChangeText={(text) => this.setState({ accountValueInput: text })}
          />
          {
            accountValidationMsg && (
              <Text style={styles.validationMsg}>{accountValidationMsg}</Text>
            )
          }
        </View>
        <View style={styles.password}>
          <TextInput
            style={styles.textInput}
            placeholder="密码"
            secureTextEntry={true}
            onChangeText={(text) => this.setState({ passwordValueInput: text })}
          />
          {
            passwordValidationMsg && (
              <Text style={styles.validationMsg}>{passwordValidationMsg}</Text>
            )
          }
        </View>
        <Button
          style={styles.button}
          title='登录'
          onPress={this.submit}
        />
        <View style={styles.blank}/>
        <Button
          style={styles.button}
          title='注册'
          onPress={() => this.props.navigation.navigate('register')}
        />
        <ActionSheet title={'haha'} ref={ref => this.actionSheet = ref}/>
      </View>
    );
  }
}

export default inject('store')(observer(Login))

const styles = StyleSheet.create({
  background: {
    padding: 15,
  },
  account: {
    marginBottom: 15,
  },
  password: {
    marginBottom: 15
  },
  textInput: {
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingLeft: 15,
  },
  validationMsg: {
    color: 'red'
  }, 
  blank: {
    height: 10
  }
})