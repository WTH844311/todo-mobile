import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ActionSheet from '../index'
import AsyncStorage from '@react-native-community/async-storage'

const windowWidth = Dimensions.get('window').width
let assignmentRef = null

class ShareLinkSheet extends Component {

    state = {
        user_id: null
    }

    componentDidMount() {
        AsyncStorage.getItem('user').then(user => this.setState({ user_id: JSON.parse(user).user_id }))
    }

    show = () => {
        if (assignmentRef !== null) return assignmentRef.show()
        return () => {}
    }

    hide = () => {
        if (assignmentRef !== null) return assignmentRef.hide()
        return () => {}
    }

    render() {
        const { user_id } = this.state
        const { currentList, currentTask, assignTask, users } = this.props.store
        if (!users || !user_id) return null
        return (
            <ActionSheet
                ref={ref => assignmentRef = ref}
                submitText='完成'
                submitAction={this.hide}
                translateY={currentList.members ? 200 + currentList.members.length*30 : 200}
                title='分配给'
                content={
                    <View style={styles.modalActionContainer}>
                        <View style={styles.memberList}>
                            <Text style={{ marginLeft: 15, marginBottom: 6, marginTop: 20 }}>清单成员</Text>
                            <TouchableOpacity style={styles.memberItem} onPress={async () => {
                                await assignTask(currentTask, user_id, currentList.owner_id)
                                this.hide()
                            }}>
                                <View style={styles.member_avatar}>
                                    <Text style={{ color: 'white' }}>{users.find(u => u.user_id === currentList.owner_id)?.username.substring(0, 1)}</Text>
                                </View>
                                <View style={styles.member_name}>
                                    <Text>{users.find(u => u.user_id === currentList.owner_id)?.username}</Text>
                                    {currentList.owner_id === user_id && <Text style={{ color: 'grey' }}>（分配给我）</Text>}
                                </View>
                            </TouchableOpacity>
                            {currentList.members.map(m => (
                                <TouchableOpacity key={m} style={styles.memberItem} onPress={async () => {
                                    await assignTask(currentTask, user_id, m)
                                    this.hide()
                                }}>
                                    <View style={styles.member_avatar}>
                                        <Text style={{ color: 'white' }}>{users.find(u => u.user_id === m)?.username.substring(0, 1)}</Text>
                                    </View>
                                    <View style={styles.member_name}>
                                        <Text>{users.find(u => u.user_id === m).username}</Text>
                                        {m === user_id && <Text style={{ color: 'grey' }}>（分配给我）</Text>}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(ShareLinkSheet))

const styles = StyleSheet.create({
    modalActionContainer: {
        display: 'flex',
        flexDirection: 'row',
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
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    member_option: {
        marginLeft: 'auto'
    },
})