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
import util from '../../../common/util'

let reminderSheetRef = null

class ReminderSheet extends Component {

    show = () => {
        if (reminderSheetRef !== null) return reminderSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (reminderSheetRef !== null) return reminderSheetRef.hide()
        return () => { }
    }

    render() {
        const { currentTask, setTaskReminder } = this.props.store
        const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return (
            <>
                <ActionSheet
                    ref={ref => reminderSheetRef = ref}
                    showDelete={currentTask.reminder}
                    deleteAction={() => {
                        setTaskReminder(currentTask)
                        this.hide()
                    }}
                    submitText={'完成'}
                    submitAction={this.hide}
                    translateY={250}
                    bgColor={'white'}
                    title={'提醒'}
                    content={
                        <View style={styles.modalActionContainer}>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskReminder(currentTask, new Date(new Date().setHours(new Date().getHours()+3, 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'ios-timer',
                                    iconFrom: 'Ionicons',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>今日晚些时候</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}  {new Date(new Date().setHours(new Date().getHours()+3, 0, 0, 0)).toTimeString().substring(0, 5)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskReminder(currentTask, new Date(new Date(Date.now()+24*3600*1000).setHours(new Date().getHours(), 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'calendar-minus-o',
                                    iconFrom: 'FontAwesome',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>明天</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}  {new Date(new Date(Date.now()+24*3600+1000).setHours(new Date().getHours(), 0, 0, 0)).toTimeString().substring(0, 5)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskReminder(currentTask, new Date(new Date(Date.now()+7*24*3600*1000).setHours(new Date().getHours(), 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'calendar',
                                    iconFrom: 'FontAwesome',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>下周</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}  {new Date(new Date(Date.now()+7*24*3600*1000).setHours(new Date().getHours(), 0, 0, 0)).toTimeString().substring(0, 5)}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </>
        )
    }
}

export default inject('store')(observer(ReminderSheet))

const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    modalActionContainer: {
        // paddingHorizontal: 15
    },
    actionItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: windowWidth,
        paddingHorizontal: 16,
        paddingVertical: 13
    },
    actionItemTitle: {
        marginLeft: 17,
        fontSize: 16
    },
    actionItemDescription: {
        marginLeft: 'auto',
        fontSize: 13,
        color: 'grey'
    }
})