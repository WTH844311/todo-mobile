import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { inject, observer } from 'mobx-react'
import { SwipeRow } from 'react-native-swipe-list-view'
import util from '../../common/util'
import theme from '../../common/theme'
import styles from './style'

class TaskItem extends Component {
    constructor(props) {
        super(props)
        this.swipeValueX = 0
    }

    render() {
        const { store, task, currentList, navigation } = this.props
        const { setCurrentTask } = store
        return (
            <SwipeRow
                key={task._id}
                rightOpenValue={-60}
                leftOpenValue={60}
            >
                <View style={[styles.rowBack]}>
                    <View style={styles.rowBack_left}>
                        <TouchableOpacity style={styles.left_myday} onPress={() => store.changeTaskMyday(task)}>
                            {util.getIcon({
                                icon: task.myDay ? 'sunset' : 'sun',
                                iconFrom: 'Feather',
                                color: 'white',
                            })}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.right_delete} onPress={() => store.deleteTask(task._id)}>
                        {util.getIcon({
                            icon: 'trash-2',
                            iconFrom: 'Feather',
                            color: 'white'
                        })}
                    </TouchableOpacity>
                </View>
                <View key={task._id} style={styles.taskItem}>
                    <TouchableOpacity style={styles.check} onPress={() => store.changeTaskCompleted(task)}>
                        {
                            task.completed ? util.getIcon({
                                icon: 'checkcircle',
                                iconFrom: 'AntDesign',
                                color: util.LightenDarkenColor(currentList.theme ? theme[currentList.theme] : theme.grey, -20),
                                size: 22
                            }) : util.getIcon({
                                icon: 'checkcircleo',
                                iconFrom: 'AntDesign',
                                size: 22
                            })
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.taskItem_middle} onPress={() => {
                        setCurrentTask(task)
                        navigation.navigate('details')
                    }}>
                        <>
                            <Text>{task.title}</Text>
                            <View style={styles.metadata}>
                                {task.myDay && (
                                    <View style={styles.metadataItem}>
                                        {util.getIcon({
                                            icon: 'sun',
                                            iconFrom: 'Feather',
                                            size: 10,
                                            style: styles.metadataIcon
                                        })}
                                        <Text style={styles.metadataTitle}>我的一天</Text>
                                    </View>
                                )}
                                {task.myDay && <Text> · </Text>}
                                {task.steps && task.steps.length > 0 && (
                                    <View style={styles.metadataItem}>
                                        <Text style={styles.metadataTitle}>{`${task.steps.filter(s => s.completed).length}/${task.steps.length}`}</Text>
                                    </View>
                                )}
                                {task.steps && task.steps.length > 0 && <Text> · </Text>}
                                {task.due_date && (
                                    <View style={styles.metadataItem}>
                                        {util.getIcon({
                                            icon: 'calendar',
                                            iconFrom: 'Feather',
                                            size: 10,
                                            color: new Date().setHours(0, 0, 0, 0) > new Date(task.due_date).getTime() ? 'red' : 'blue',
                                            style: styles.metadataIcon
                                        })}
                                        <Text style={[styles.metadataTitle, new Date().setHours(0, 0, 0, 0) > new Date(task.due_date).getTime() ? { color: 'red' } : { color: 'blue' }]}>{util.formatDate(task.due_date)}</Text>
                                        {task.recurrence && (
                                            util.getIcon({
                                                icon: 'repeat',
                                                iconFrom: 'Feather',
                                                size: 10,
                                                color: new Date().setHours(0, 0, 0, 0) > new Date(task.due_date).getTime() ? 'red' : 'blue',
                                                style: styles.metadataIcon
                                            })
                                        )}
                                    </View>
                                )}
                                {task.due_date && <Text> · </Text>}
                                {task.reminder && !task.completed && Date.now() < new Date(task.reminder.date).getTime() && (
                                    <View style={styles.metadataItem}>
                                        {util.getIcon({
                                            icon: 'bell',
                                            iconFrom: 'Feather',
                                            size: 10,
                                            style: styles.metadataIcon
                                        })}
                                    </View>
                                )}
                                {task.reminder && !task.completed && Date.now() < new Date(task.reminder.date).getTime() && <Text> · </Text>}
                                {task.linkedEntities && task.linkedEntities.length > 0 && (
                                    <View style={styles.metadataItem}>
                                        {util.getIcon({
                                            icon: 'link',
                                            iconFrom: 'AntDesign',
                                            size: 10,
                                            style: styles.metadataIcon
                                        })}
                                    </View>
                                )}
                                {task.linkedEntities && task.linkedEntities.length > 0 && <Text> · </Text>}
                                {task.note_updated_at && (
                                    <View style={styles.metadataItem}>
                                        {util.getIcon({
                                            icon: 'sticky-note-o',
                                            iconFrom: 'FontAwesome',
                                            size: 10,
                                            style: styles.metadataIcon
                                        })}
                                    </View>
                                )}
                            </View>
                        </>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => store.changeTaskImportance(task)}>
                        {task.importance ? util.getIcon({
                            icon: 'star',
                            iconFrom: 'FontAwesome',
                            color: util.LightenDarkenColor(currentList.theme ? theme[currentList.theme] : theme.grey, -20)
                        }) : util.getIcon({
                            icon: 'star-o',
                            iconFrom: 'FontAwesome'
                        })}
                    </TouchableOpacity>
                </View>
            </SwipeRow>
        )
    }
}

export default inject('store')(observer(TaskItem))
