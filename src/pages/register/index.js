import React, { Component } from 'react'
import { View, Text, Button, Dimensions, StyleSheet, TextInput } from 'react-native'
import { StackActions, NavigationActions } from '@react-navigation/native'
import { serverDomain } from '../../common/config'

export default class Register extends Component {

  state = {
    emailValueInput: false,
    emailValidationMsg: null,
    captchaValueInput: false,
    usernameValueInput: false,
    usernameValidationMsg: null,
    passwordValueInput: false,
    passwordValidationMsg: null,
    sendEmailButtomValue: '获取验证码',
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { emailValueInput, usernameValueInput } = this.state
    if (prevState.emailValueInput !== emailValueInput && emailValueInput) {
      const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
      if (reg.test(emailValueInput)) {
        this.emailVerify().then(result => {
          if (!result) {
            this.setState({ emailValidationMsg: '邮箱已被注册' })
          } else {
            this.setState({ emailValidationMsg: null })
          }
        })
      } else {
        this.setState({ emailValidationMsg: '邮箱格式错误' })
      }
    }
    if (prevState.usernameValueInput !== usernameValueInput) {
      if (usernameValueInput) {
        this.usernameVerify().then(result => {
          if (!result) this.setState({ usernameValidationMsg: '用户名已存在' })
        })
      }
    }
  }

  submit = async () => {
    const { emailValueInput, passwordValueInput, captchaValueInput, usernameValueInput } = this.state
    if (!emailValueInput) this.setState({ emailValidationMsg: '该项不能为空' })
    if (!usernameValueInput) this.setState({ usernameValidationMsg: '该项不能为空' })
    if (!passwordValueInput) this.setState({ passwordValidationMsg: '该项不能为空' })
    if (!usernameValueInput || !passwordValueInput || !emailValueInput || !captchaValueInput) return
    try {
      const res = await fetch(`${serverDomain}user/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailValueInput,
          captcha: captchaValueInput,
          username: usernameValueInput,
          password: passwordValueInput
        })
      })
      const data = await res.json()
      if (data.code === 1) {
        this.props.navigation.navigate('login')
      }
    } catch (error) {
      console.log('submit error:' + error)
    }
  }

  sendEmail = async () => {
    if (!this.state.emailValueInput) {
      this.setState({ emailValidationMsg: '该项不能为空' })
      return
    }
    try {
      await fetch(`${serverDomain}user/sendEmail`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.state.emailValueInput
        })
      })
    } catch (error) {
      console.log('emailVerify error: ' + error)
    }
    let countDown = 15
    const timer = setInterval(() => {
      if (countDown === 0) {
        clearInterval(timer)
        this.setState({ sendEmailButtomValue: '获取验证码' })
      } else {
        this.setState({ sendEmailButtomValue: `${--countDown} 秒后重新获取` })
      }
    }, 1000)
  }

  emailVerify = async () => {
    try {
      const res = await fetch(`${serverDomain}user/vertify/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.state.emailValueInput
        })
      })
      const data = await res.json()
      return +data.code === 1
    } catch (error) {
      console.log('emailVerify error: ' + error)
    }
  }

  usernameVerify = async () => {
    try {
      const res = await fetch(`${serverDomain}user/vertify/username`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.usernameValueInput
        })
      })
      const data = await res.json()
      return data.code === 1
    } catch (error) {
      console.log('usernameVerify error: ' + error)
    }
  }

  render() {
    const { usernameValidationMsg, emailValidationMsg, passwordValidationMsg, sendEmailButtomValue } = this.state
    return (
      <View style={styles.background}>
        <View style={styles.account}>
          <TextInput
            style={styles.textInput}
            placeholder="邮箱"
            onChangeText={(text) => this.setState({ emailValueInput: text })}
          />
          {
            emailValidationMsg && (
              <Text style={styles.validationMsg}>{emailValidationMsg}</Text>
            )
          }
        </View>
        <View style={styles.captcha}>
          <View style={styles.captchaInner}>
            <TextInput
              style={styles.captchaInput}
              placeholder="验证码"
              onChangeText={(text) => this.setState({ captchaValueInput: text })}
            />
            <Button
              title={sendEmailButtomValue}
              disabled={sendEmailButtomValue !== '获取验证码'}
              onPress={this.sendEmail}
            />
          </View>
        </View>
        <View style={styles.username}>
          <TextInput
            style={styles.textInput}
            placeholder="用户名"
            onChangeText={(text) => this.setState({ usernameValueInput: text })}
          />
          {
            usernameValidationMsg && (
              <Text style={styles.validationMsg}>{usernameValidationMsg}</Text>
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
        <View style={styles.submit}>
          <Button
            title="注册"
            onPress={this.submit}
          />
        </View>

      </View>
    );
  }
}

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
  background: {
    padding: 15
  },
  account: {
    marginBottom: 15,
  },
  password: {
    marginBottom: 15
  },
  captcha: {
    marginBottom: 15
  },
  captchaInner: {
    display: 'flex',
    flexDirection: 'row'
  },
  captchaInput: {
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingLeft: 15,
    flex: 1,
    marginRight: 10
  },
  username: {
    marginBottom: 15
  },
  textInput: {
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingLeft: 15
  },
  validationMsg: {
    color: 'red'
  }
})