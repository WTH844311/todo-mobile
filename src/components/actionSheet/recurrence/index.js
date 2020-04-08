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

let recurrenceSheetRef = null

class RecurrenceSheet extends Component {

    show = () => {
        if (recurrenceSheetRef !== null) return recurrenceSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (recurrenceSheetRef !== null) return recurrenceSheetRef.hide()
        return () => { }
    }

    render() {
        const { currentTask, setTaskRecurrence } = this.props.store
        return (
            <ActionSheet
                ref={ref => recurrenceSheetRef = ref}
                showDelete={currentTask.recurrence}
                deleteAction={() => {
                    setTaskRecurrence(currentTask)
                    this.hide()
                }}
                submitText={'完成'}
                submitAction={this.hide}
                translateY={330}
                bgColor={'white'}
                title={'重复'}
                content={
                    <View style={styles.modalActionContainer}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            setTaskRecurrence(currentTask, 1)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'dot-single',
                                iconFrom: 'Entypo',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>每天</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            setTaskRecurrence(currentTask, 3)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'dots-two-vertical',
                                iconFrom: 'Entypo',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>每周</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            setTaskRecurrence(currentTask, 2)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'dots-three-vertical',
                                iconFrom: 'Entypo',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>工作日</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            setTaskRecurrence(currentTask, 4)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'chart-bubble',
                                iconFrom: 'MaterialCommunityIcons',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>每月</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            setTaskRecurrence(currentTask, 5)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'ios-flower',
                                iconFrom: 'Ionicons',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>每年</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(RecurrenceSheet))

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
    }
})