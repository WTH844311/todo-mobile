import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    Switch
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ActionSheet from '../index'
import { shareLink_prefix } from '../../../common/config'

const windowWidth = Dimensions.get('window').width
let taskShareSheetRef = null

class TaskShareSecondSheet extends Component {

    show = () => {
        if (taskShareSheetRef !== null) return taskShareSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (taskShareSheetRef !== null) return taskShareSheetRef.hide()
        return () => { }
    }

    render() {
        const { fatherSheet, store } = this.props
        const { currentList } = store
        if (!currentList) return null
        return (
            <>
                <ActionSheet
                    ref={ref => taskShareSheetRef = ref}
                    showBack
                    backAction={() => {
                        this.hide()
                        fatherSheet()
                    }}
                    submitText={'完成'}
                    submitAction={this.hide}
                    translateY={500}
                    title={'更多选项'}
                    content={
                        <View style={styles.modalActionContainer}>
                            <View style={styles.shareTop}>
                                <View style={[styles.optionItem, {
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }]}>
                                    <Text>将访问权限限制于当前成员</Text>
                                    <Switch
                                        value={currentList.sharing_status === 'Limit'}
                                        onValueChange={() => {
                                            store.limitShare(currentList)
                                            console.log(currentList.sharing_status)
                                        }}
                                    />
                                </View>
                                <Text style={{ 
                                    color: 'grey', 
                                    paddingVertical: 7, 
                                    paddingHorizontal: 15,
                                    marginBottom: 15
                                }}>
                                    打开此切换可防止新的人员加入清单。
                                </Text>
                                {currentList.invitation_token && (
                                    <View style={styles.optionItem}>
                                        <Text style={{ marginBottom: 5 }}>邀请链接</Text>
                                        <Text selectable style={{ color: 'grey' }}>{shareLink_prefix + 'sharing/' + currentList.invitation_token}</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity style={styles.shareButton} onPress={() => {
                                store.closeShare(currentList)
                                this.hide()
                            }}>
                                <Text style={{ color: 'white', fontSize: 15 }}>停止共享</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </>
        )
    }
}

export default inject('store')(observer(TaskShareSecondSheet))

const styles = StyleSheet.create({
    modalActionContainer: {
        display: 'flex',
        alignItems: 'center',
        width: windowWidth,
    },
    shareTop: {
        marginTop: 25, 
        marginBottom: 60, 
    },
    shareButton: {
        paddingVertical: 12,
        width: windowWidth * .78,
        backgroundColor: 'red',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    optionItem: {
        width: windowWidth,
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderColor: '#f3f3f3',
        borderBottomWidth: 1,
        borderTopWidth: 1,
    }
})