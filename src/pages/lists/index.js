import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableHighlight,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { inject, observer } from 'mobx-react'
import AsyncStorage from '@react-native-community/async-storage'
import { SwipeRow } from 'react-native-swipe-list-view'
import util from '../../common/util'
import theme from '../../common/theme'

class Lists extends Component {

    componentDidMount() {
        const { users, getUsers, getTasks, getLists, initWs, ws, realm, initRealm } = this.props.store
        this.checkLoginStatus()
        if (!realm) initRealm()
        getTasks()
        getLists()
        if (users.length === 0) getUsers()
        if (!ws) initWs()
    }

    checkLoginStatus = async () => {
        const token = await AsyncStorage.getItem('token')
        const user = await AsyncStorage.getItem('user')
        if (!token || !user) return this.props.navigation.navigate('login')
    }

    render() {
        const { navigation, store } = this.props
        const { myday, important, planned, assigned_to_me, inbox, setCurrentList, lists } = store
        const defaultList = [myday, important, planned, assigned_to_me, inbox]
        return (
            <View style={styles.background}>
                <ScrollView style={styles.scrollView}>
                    {
                        defaultList.map((list, index) => (
                            <TouchableHighlight key={index} style={styles.listItem} onPress={() => {
                                setCurrentList(list)
                                navigation.navigate('tasks')
                            }}>
                                <>
                                    <View style={styles.listItemLeft}>
                                        {util.getIcon({
                                            icon: list.icon,
                                            iconFrom: list.iconFrom,
                                            color: list.theme || 'blue',
                                            style: styles.icon
                                        })}
                                        <Text style={styles.title}>{list.title}</Text>
                                    </View>
                                    <Text style={styles.taskCount}>
                                        {list.tasks.filter(t => !t.completed).length > 0 
                                            ? list.tasks.filter(t => !t.completed).length 
                                            : ''}
                                    </Text>
                                </>
                            </TouchableHighlight>
                        ))
                    }
                    <View style={styles.divider}><View style={styles.dividerInner}/></View>
                    {
                        lists.slice().sort((a, b) => b.position-a.position).map((list, index) => (
                            <SwipeRow
                                key={list._id}
                                disableRightSwipe
                                rightOpenValue={-60}
                            >
                                <View style={styles.rowBack}>
                                    <Text>Left Hidden</Text>
                                    <TouchableOpacity onPress={() => store.deleteList(list._id)}>
                                        {util.getIcon({
                                            icon: 'trash-2',
                                            iconFrom: 'Feather',
                                            color: 'white',
                                            style: {marginRight: 10}
                                        })}
                                    </TouchableOpacity>
                                </View>
                                <TouchableHighlight style={[styles.listItem, styles.rowFront]} onPress={() => {
                                    setCurrentList(list)
                                    navigation.navigate('tasks')
                                }}>
                                    <>
                                        <View style={styles.listItemLeft}>
                                            {util.getIcon({
                                                icon: 'list',
                                                iconFrom: 'Feather',
                                                color: list.theme || theme.grey,
                                                style: styles.icon
                                            })}
                                            <Text style={styles.title}>{list.title}</Text>
                                        </View>
                                        <Text style={styles.taskCount}>
                                            {list.tasks.filter(t => !t.completed).length > 0 
                                                ? list.tasks.filter(t => !t.completed).length 
                                                : ''}
                                        </Text>
                                    </>
                                </TouchableHighlight>
                            </SwipeRow>
                        ))
                    }
                </ScrollView>
                <View style={styles.input}>
                    <View style={styles.inputLeft}>
                        {util.getIcon({
                            icon: 'add',
                            iconFrom: 'MaterialIcons',
                            size: 32,
                            style: styles.icon
                        })}
                        <Text style={styles.textInput} onPress={() => {
                            setCurrentList({})
                            navigation.navigate('tasks', {
                                inputAutoFocus: true
                            })
                        }}>
                            新建清单
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    background: {
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
        backgroundColor: 'white',
        height: windowHeight
    },
    divider: {
        width: windowWidth,
        display: 'flex',
        alignItems: 'center',
        marginVertical: 10
    },
    dividerInner: {
        width: windowWidth*.9,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    scrollView: {
        flex: 1,
    },
    rowBack: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: 'red'
    },
    listItem: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        width: windowWidth,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    listItemLeft: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 15
    },
    title: {
        fontWeight: '900',
        fontSize: 16
    },
    taskCount: {
        marginLeft: 'auto'
    },
    input: {
        width: windowWidth,
        flexBasis: 125,
        display: 'flex',
        flexDirection: 'row',
    },
    inputLeft: {
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: 14
    },
    textInput: {
        position: 'relative',
        top: 7,
        fontSize: 16,
        color: '#1c57c3',
        borderRadius: 6,
        width: windowWidth * .7,
    }
})

export default inject('store')(observer(Lists))