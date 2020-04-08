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

let taskOptionSheetRef = null

class TaskOptionSortSheet extends Component {

    show = () => {
        if (taskOptionSheetRef !== null) return taskOptionSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (taskOptionSheetRef !== null) return taskOptionSheetRef.hide()
        return () => { }
    }

    render() {
        const { store, fatherSheet } = this.props
        if (!store.currentList) return null
        return (
            <ActionSheet
                ref={ref => taskOptionSheetRef = ref}
                showBack
                backAction={() => {
                    this.hide()
                    fatherSheet()
                }}
                submitText={'完成'}
                submitAction={this.hide}
                translateY={370}
                bgColor={'white'}
                title={'排序'}
                content={
                    <View style={styles.modalActionContainer}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            store.changeListSortType(store.currentList, 1)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'star-o',
                                iconFrom: 'FontAwesome',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>重要性</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.actionItem} onPress={() => store.changeListSortType(store.currentList, 1)}>
                            {util.getIcon({
                                icon: 'sort-alphabetical',
                                iconFrom: 'MaterialCommunityIcons',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>字母顺序</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            store.changeListSortType(store.currentList, 2)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'calendar',
                                iconFrom: 'Feather',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>截止日期</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            store.changeListSortType(store.currentList, 6)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'add-to-list',
                                iconFrom: 'Entypo',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>创建日期</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            store.changeListSortType(store.currentList, 4)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'checkcircleo',
                                iconFrom: 'AntDesign',
                                size: 16,
                                color: 'black'
                            })}
                            <Text style={styles.actionItemTitle}>已完成</Text>
                        </TouchableOpacity>
                        {
                            store.currentList._id !== 'myday' && (
                                <TouchableOpacity style={styles.actionItem} onPress={() => {
                                    store.changeListSortType(store.currentList, 3)
                                    this.hide()
                                }}>
                                    {util.getIcon({
                                        icon: 'sun',
                                        iconFrom: 'Feather',
                                        size: 16,
                                        color: 'black'
                                    })}
                                    <Text style={styles.actionItemTitle}>已添加到“我的一天”</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(TaskOptionSortSheet))

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