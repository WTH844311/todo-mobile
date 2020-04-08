import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions
} from 'react-native'
import { inject, observer } from 'mobx-react'
import TaskOptionSortSheet from '../taskOptions_sort/index'
import TaskOptionThemeSheet from '../taskOptions_theme/index'
import ActionSheet from '../index'
import util from '../../../common/util'

let taskOptionSheetRef = null,
    taskOptionSortRef = null,
    taskOptionThemeRef = null

class TaskOptionSheet extends Component {

    show = () => {
        if (taskOptionSheetRef !== null) return taskOptionSheetRef.show()
        return () => { }
    }
    
    hide = () => {
        if (taskOptionSheetRef !== null) return taskOptionSheetRef.hide()
        return () => { }
    }

    render() {
        const store = this.props.store
        if (!store.currentList) return null
        return (
            <>
                <TaskOptionSortSheet ref={ref => taskOptionSortRef = ref} fatherSheet={this.show} />
                <TaskOptionThemeSheet ref={ref => taskOptionThemeRef = ref} fatherSheet={this.show} />
                <ActionSheet
                    ref={ref => taskOptionSheetRef = ref}
                    submitText={'完成'}
                    submitAction={this.hide}
                    translateY={280}
                    bgColor={'white'}
                    title={'列表选项'}
                    content={
                        <View style={styles.modalActionContainer}>
                            {!store.currentList.defaultList && (
                                <TouchableOpacity style={styles.actionItem} onPress={() => {
                                    store.setShowTaskTitleInput(true)
                                    this.hide()
                                }}>
                                    {util.getIcon({
                                        icon: 'input',
                                        iconFrom: 'MaterialIcons',
                                        size: 16,
                                        color: 'black'
                                    })}
                                    <Text style={styles.actionItemTitle}>重命名清单</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                this.hide()
                                taskOptionSortRef.show()
                            }}>
                                {util.getIcon({
                                    icon: 'sort',
                                    iconFrom: 'MaterialCommunityIcons',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>排序</Text>
                                {util.getIcon({
                                    icon: 'navigate-next',
                                    iconFrom: 'MaterialIcons',
                                    size: 25,
                                    style: { marginLeft: 'auto' }
                                })}
                            </TouchableOpacity>
                            {!store.currentList.defaultList && (
                                <TouchableOpacity style={styles.actionItem} onPress={() => {
                                    this.hide()
                                    taskOptionThemeRef.show()
                                }}>
                                    {util.getIcon({
                                        icon: 'palette-outline',
                                        iconFrom: 'MaterialCommunityIcons',
                                        size: 16,
                                        color: 'black'
                                    })}
                                    <Text style={styles.actionItemTitle}>更改主题</Text>
                                    {util.getIcon({
                                        icon: 'navigate-next',
                                        iconFrom: 'MaterialIcons',
                                        size: 25,
                                        style: { marginLeft: 'auto' }
                                    })}
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.actionItem} onPress={() => {
                                store.changeListShowCompleted(store.currentList)
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'checkcircleo',
                                    iconFrom: 'AntDesign',
                                    size: 16,
                                    color: 'black'
                                })}
                                <Text style={styles.actionItemTitle}>{store.currentList.show_completed ? '隐藏已完成任务' : '显示完成的任务'}</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.actionItem} onPress={() => {
                                store.deleteList(store.currentList._id)
                                this.hide()
                            }}>
                                {util.getIcon({
                                    icon: 'trash-2',
                                    iconFrom: 'Feather',
                                    size: 16,
                                    color: 'red'
                                })}
                                <Text style={[styles.actionItemTitle, { color: 'red' }]}>删除清单</Text>
                            </TouchableOpacity> */}
                        </View>
                    }
                />
            </>
        )
    }
}

export default inject('store')(observer(TaskOptionSheet))

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