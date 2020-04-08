import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ActionSheet from '../index'
import TaskShareSecondSheet from '../taskShareSecond/index'
import ShareLinkSheet from '../shareLink/index'
import util from '../../../common/util'
import AsyncStorage from '@react-native-community/async-storage'

const windowWidth = Dimensions.get('window').width
let taskShareSheetRef = null,
    taskShareSecondRef = null,
    shareLinkRef = null

class TaskShareFirstSheet extends Component {

    state = {
        user_id: null
    }

    componentDidMount() {
        AsyncStorage.getItem('user').then(user => this.setState({ user_id: JSON.parse(user).user_id }))
    }

    componentWillUnmount() {
        taskShareSheetRef = null
    }

    show = () => {
        console.log(taskShareSheetRef !== null)
        if (taskShareSheetRef !== null) return taskShareSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (taskShareSheetRef !== null) return taskShareSheetRef.hide()
        return () => { }
    }

    render() {
        const { user_id } = this.state
        const { currentList, openShare, users, removeMember } = this.props.store
        if (!currentList || !users || !user_id) return null
        return (
            <>
                <TaskShareSecondSheet ref={ref => taskShareSecondRef = ref} fatherSheet={this.show}/>
                <ShareLinkSheet ref={ref => shareLinkRef = ref}/>
                <ActionSheet
                    ref={ref => taskShareSheetRef = ref}
                    submitText={'完成'}
                    submitAction={this.hide}
                    translateY={530}
                    title={'共享列表'}
                    content={
                        <View style={styles.modalActionContainer}>
                            {currentList.sharing_status !== 'NotShare' ? (
                                <View style={styles.memberList}>
                                    <Text style={{ marginLeft: 15, marginBottom: 6 }}>清单成员</Text>
                                    <View style={styles.memberItem}>
                                        <View style={styles.member_avatar}>
                                            <Text style={{ color: 'white' }}>{users.find(u => u.user_id === currentList.owner_id)?.username.substring(0, 1)}</Text>
                                        </View>
                                        <View style={styles.member_name}>
                                            <Text>{users.find(u => u.user_id === currentList.owner_id)?.username}</Text>
                                        </View>
                                        <View style={styles.member_option}>
                                            <Text style={{color: 'grey', fontSize: 13}}>所有者</Text>
                                        </View>
                                    </View>
                                    {currentList.members?.map(m => (
                                        <View key={m} style={styles.memberItem}>
                                            <View style={styles.member_avatar}>
                                                <Text style={{ color: 'white' }}>{users.find(u => u.user_id === m)?.username.substring(0, 1)}</Text>
                                            </View>
                                            <View style={styles.member_name}>
                                                <Text>{users.find(u => u.user_id === m)?.username}</Text>
                                            </View>
                                            {currentList.owner_id === user_id && (
                                                <TouchableOpacity style={styles.member_option} onPress={() => removeMember(m, currentList)}>
                                                    {util.getIcon({
                                                        icon: 'close',
                                                        iconFrom: 'EvilIcons',
                                                        size: 17,
                                                        style: { paddingLeft: 10, paddingVertical: 10 }
                                                    })}
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.shareTop}>
                                    {util.getIcon({
                                        icon: 'paper-plane-o',
                                        iconFrom: 'FontAwesome',
                                        size: 80,
                                        color: 'grey',
                                        style: { marginBottom: 50 }
                                    })}
                                    <Text style={{ fontSize: 15, textAlign: 'center' }}>请邀请一些人员。在其加入后，将在此处显示。</Text>
                                </View>
                            )}
                            <View style={styles.shareAction}>
                                <TouchableOpacity style={styles.shareButton} onPress={async () => {
                                    if (currentList.sharing_status !== 'Open') await openShare(currentList) 
                                    shareLinkRef.show()
                                }}>
                                    {util.getIcon({
                                        icon: 'share-alternative',
                                        iconFrom: 'Entypo',
                                        color: 'white',
                                        style: { marginRight: 10 }
                                    })}
                                    <Text style={{ color: 'white', fontSize: 15 }}>邀请方式...</Text>
                                </TouchableOpacity>
                                <Text style={styles.shareActionTip}>具有此链接和 Todo 帐户的任何人都可以加入并编辑此列表。</Text>
                                {currentList.sharing_status !== 'NotShare' && (
                                    <TouchableOpacity style={styles.optionButton} onPress={() => {
                                        this.hide()
                                        taskShareSecondRef.show()
                                    }}>
                                        <Text style={styles.optionButtonText}>管理访问权限</Text>
                                        {util.getIcon({
                                            icon: 'navigate-next',
                                            iconFrom: 'MaterialIcons',
                                            size: 25,
                                            color: '#1661bd',
                                            style: { marginLeft: 'auto' }
                                        })}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    }
                />
            </>
        )
    }
}

export default inject('store')(observer(TaskShareFirstSheet))

const styles = StyleSheet.create({
    modalActionContainer: {
        paddingVertical: 20,
        display: 'flex',
        alignItems: 'center',
        width: windowWidth,
    },
    memberList: {
        width: windowWidth,
        height: 270,
        overflow: 'scroll'
    },
    memberItem: {
        backgroundColor: 'white',
        width: windowWidth,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomColor: '#f3f3f3',
        borderBottomWidth: 1,
        borderTopColor: '#f3f3f3',
        borderTopWidth: 1,
    },
    member_avatar: {
        height: 28,
        width: 28,
        borderRadius: 14,
        backgroundColor: 'black',
        marginRight: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    member_name: {
        flex: 1
    },
    member_option: {
        marginLeft: 'auto'
    },
    shareTop: {
        paddingHorizontal: 25, 
        marginTop: 25, 
        marginBottom: 50, 
        display: 'flex', 
        alignItems: 'center'
    },
    shareAction: {
        display: 'flex', 
        alignItems: 'center', 
        paddingHorizontal: 22
    },
    shareActionTip: {
        color: 'grey', 
        textAlign: 'center', 
        marginBottom: 20
    },
    optionButton: {
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center'
    },
    optionButtonText: {
        color: '#1661bd', 
        fontSize: 15, 
        fontWeight: '700'
    },
    shareButton: {
        paddingVertical: 12,
        width: windowWidth * .78,
        backgroundColor: '#1678bd',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    }
})