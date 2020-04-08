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

let dueDateSheetRef = null

class DueDateSheet extends Component {

    show = () => {
        if (dueDateSheetRef !== null) return dueDateSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (dueDateSheetRef !== null) return dueDateSheetRef.hide()
        return () => { }
    }

    render() {
        const { currentTask, setTaskDueDate } = this.props.store
        const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return (
            <>
                <ActionSheet
                    ref={ref => dueDateSheetRef = ref}
                    showDelete={currentTask.due_date}
                    deleteAction={() => {
                        setTaskDueDate(currentTask)
                        this.hide()
                    }}
                    submitText={'完成'}
                    submitAction={this.hide}
                    translateY={250}
                    bgColor={'white'}
                    title={'截止'}
                    content={
                        <View style={styles.modalActionContainer}>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskDueDate(currentTask, new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'today',
                                    iconFrom: 'MaterialIcons',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>今天</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskDueDate(currentTask, new Date(new Date(Date.now()+1*24*3600*1000).setHours(0, 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'calendar-minus-o',
                                    iconFrom: 'FontAwesome',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>明天</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                setTaskDueDate(currentTask, new Date(new Date(Date.now()+7*24*3600*1000).setHours(0, 0, 0, 0)).toISOString())
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'calendar',
                                    iconFrom: 'FontAwesome',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>下周</Text>
                                <Text style={styles.actionItemDescription}>{week[new Date().getDay()]}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </>
        )
    }
}

export default inject('store')(observer(DueDateSheet))

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