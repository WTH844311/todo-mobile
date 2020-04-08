import React, { Component } from 'react'
import { View, TextInput, Text, ScrollView, StyleSheet, Dimensions, TouchableHighlight, TouchableOpacity } from 'react-native'
import { inject, observer } from 'mobx-react'
import DetailNoteEditSheet from '../../components/actionSheet/detailNoteEdit/index'
import ReminderSheet from '../../components/actionSheet/reminder/index'
import DueDateSheet from '../../components/actionSheet/dueDate/index'
import RecurrenceSheet from '../../components/actionSheet/recurrence/index'
import AssignmentSheet from '../../components/actionSheet/assignment/index'
import DocumentPicker from 'react-native-document-picker'
import AsyncStorage from '@react-native-community/async-storage'
import theme from '../../common/theme'
import util from '../../common/util'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    background: {
        backgroundColor: 'white',
        height: windowHeight,
    },
    icon: {
        marginRight: 15
    },
    unset: {
        color: 'grey'
    },
    active: {
        color: 'blue'
    },
    invalid: {
        color: 'red'
    },
    addIcon: {
        marginRight: 10,
        marginLeft: -5
    },
    delete: {
        marginLeft: 'auto'
    },
    top: {
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 23,
        flex: 1
    },
    importance: {
        marginLeft: 'auto'
    },
    scrollView: {
        paddingHorizontal: 23,
    },
    steps: {
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: .5
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    stepItemLeft: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    addStep: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    section: {
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: .5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15
    },
    sectionItem: {
        paddingVertical: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    schedule: {
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: .5,
    },
    note: {
        paddingVertical: 15,
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: .5,
    },
    footer: {
        backgroundColor: 'white',
        width: windowWidth,
        flexBasis: 130,
        paddingHorizontal: 20,
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 10,
        justifyContent: 'space-evenly'
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        marginRight: 10
    }
})


class TaskDetails extends Component {

    constructor(props) {
        super(props)
        this.detailNoteEditRef = null
        this.reminderRef = null
        this.dueDateRef = null
        this.recurrenceRef = null
        this.assignmentRef = null
        this.state = {
            showTitleInput: false,
            showStepInput: false,
            user_id: null
        }
    }

    componentDidMount() {
        AsyncStorage.getItem('user').then(user => this.setState({ user_id: JSON.parse(user).user_id }))
    }

    detailNoteEditShow = () => {
        if (this.detailNoteEditRef !== null) return this.detailNoteEditRef.show()
        return () => { }
    }

    detailNoteEditHide = () => {
        if (this.detailNoteEditRef !== null) return this.detailNoteEditRef.hide()
        return () => { }
    }

    reminderSheetShow = () => {
        if (this.reminderRef !== null) return this.reminderRef.show()
        return () => { }
    }

    reminderSheetHide = () => {
        if (this.reminderRef !== null) return this.reminderRef.hide()
        return () => { }
    }

    dueDateSheetShow = () => {
        if (this.dueDateRef !== null) return this.dueDateRef.show()
        return () => { }
    }

    dueDateSheetHide = () => {
        if (this.dueDateRef !== null) return this.dueDateRef.hide()
        return () => { }
    }

    recurrenceSheetShow = () => {
        if (this.recurrenceRef !== null) return this.recurrenceRef.show()
        return () => { }
    }

    recurrenceSheetHide = () => {
        if (this.recurrenceRef !== null) return this.recurrenceRef.hide()
        return () => { }
    }

    assignmentSheetShow = () => {
        if (this.assignmentRef !== null) return this.assignmentRef.show()
        return () => { }
    }

    assignmentSheetHide = () => {
        if (this.assignmentRef !== null) return this.assignmentRef.hide()
        return () => { }
    }

    closeControlPanel = () => {
        this._drawer.close()
    };
    openControlPanel = () => {
        this._drawer.open()
    };

    bytesToSize = bytes => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    mimeTypeTofileName = type => {
        switch (true) {
            case type.includes('image'):
                return '图片'
            case type.includes('office'):
            case type.includes('document'):
            case type.includes('excel'):
            case type.includes('ms'):
                return '文档'
            case type.includes('powerpoint'):
                return 'PowerPoint'
            default:
                return '文件'
        }
    }

    render() {
        const { showStepInput, showTitleInput, user_id } = this.state
        const { store } = this.props
        const { currentTask, currentList, users } = store
        const interval = () => {
            if (currentTask.recurrence) {
                switch (currentTask.recurrence.type) {
                    case 'Daily':
                        return `每${currentTask.recurrence.interval > 1 ? ` ${currentTask.recurrence.interval} ` : ''}天`
                    case 'Weekly':
                        if (util.arraysEqual(currentTask.recurrence.days_of_week, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) && currentTask.recurrence.type === 'Weekly') {
                            return '工作日'
                        }
                        return `每${currentTask.recurrence.interval > 1 ? ` ${currentTask.recurrence.interval} ` : ''}周`
                    case 'Monthly':
                        return `每${currentTask.recurrence.interval > 1 ? ` ${currentTask.recurrence.interval} 个` : ''}月`
                    case 'Yearly':
                        return `每${currentTask.recurrence.interval > 1 ? ` ${currentTask.recurrence.interval} ` : ''}年`
                }
            }
            return '重复'
        }
        const daysOfWeek = () => {
            if (currentTask.recurrence && currentTask.recurrence.days_of_week.length > 0) {
                let a = [],
                    o = {
                        'Monday': '星期一',
                        'Tuesday': '星期二',
                        'Wednesday': '星期三',
                        'Thursday': '星期四',
                        'Friday': '星期五',
                        'Saturday': '星期六',
                        'Sunday': '星期日'
                    }
                a = currentTask.recurrence.days_of_week.map(d => d = o[d])
                return a
            }
            return []
        }
        if (!currentTask || !currentList || !users || !user_id) return null
        return (
            <>
                <DetailNoteEditSheet ref={ref => this.detailNoteEditRef = ref} />
                <ReminderSheet ref={ref => this.reminderRef = ref} />
                <DueDateSheet ref={ref => this.dueDateRef = ref} />
                <RecurrenceSheet ref={ref => this.recurrenceRef = ref} />
                <AssignmentSheet ref={ref => this.assignmentRef = ref} />
                <View style={styles.background}>
                    <View style={styles.top}>
                        <TouchableOpacity onPress={() => store.changeTaskCompleted(currentTask)}>
                            {
                                currentTask.completed ? util.getIcon({
                                    icon: 'checkcircle',
                                    iconFrom: 'AntDesign',
                                    size: 23,
                                    style: styles.icon,
                                    color: theme[currentList.theme || 'grey']
                                }) : util.getIcon({
                                    icon: 'checkcircleo',
                                    iconFrom: 'AntDesign',
                                    size: 25,
                                    style: styles.icon,
                                    color: theme[currentList.theme || 'grey']
                                })
                            }
                        </TouchableOpacity>
                        {showTitleInput ? (
                            <TextInput
                                autoFocus={true}
                                defaultValue={currentTask.title}
                                onSubmitEditing={e => {
                                    store.renameTask(currentTask, e.nativeEvent.text)
                                    this.setState({ showTitleInput: false })
                                }}
                            />
                        ) : (
                            <Text style={styles.title} onPress={() => this.setState({ showTitleInput: true })}>{currentTask.title}</Text>
                        )}
                        <TouchableOpacity style={styles.importance} onPress={() => store.changeTaskImportance(currentTask)}>
                            {currentTask.importance ? util.getIcon({
                                icon: 'star',
                                iconFrom: 'FontAwesome',
                                color: theme[currentList.theme || 'grey']
                            }) : util.getIcon({
                                icon: 'star-o',
                                iconFrom: 'FontAwesome',
                                color: theme[currentList.theme || 'grey']
                            })}
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollView} androidoverScrollMode={'always'}>
                        <View style={styles.steps}>
                            {currentTask.steps.slice().sort((a, b) => a.position - b.position).map((step, i) => (
                                <View key={i} style={styles.stepItem}>
                                    <View style={styles.stepItemLeft}>
                                        <TouchableOpacity onPress={() => store.changeStepCompleted(currentTask, step)}>
                                            {
                                                step.completed ? util.getIcon({
                                                    icon: 'checkcircle',
                                                    iconFrom: 'AntDesign',
                                                    style: styles.icon,
                                                    color: theme[currentList.theme || 'grey']
                                                }) : util.getIcon({
                                                    icon: 'checkcircleo',
                                                    iconFrom: 'AntDesign',
                                                    style: styles.icon,
                                                    color: theme[currentList.theme || 'grey']
                                                })
                                            }
                                        </TouchableOpacity>
                                        <TextInput
                                            style={{ width: 230, paddingVertical: 0 }}
                                            defaultValue={step.title}
                                            onSubmitEditing={e => store.renameStep(currentTask, e.nativeEvent.text, i)}
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.delete} onPress={() => store.deleteTaskStep(currentTask, step)}>
                                        {util.getIcon({
                                            icon: 'close',
                                            iconFrom: 'EvilIcons',
                                        })}
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.addStep}>
                                {util.getIcon({
                                    icon: 'add',
                                    iconFrom: 'MaterialIcons',
                                    size: 30,
                                    style: styles.addIcon
                                })}
                                <TextInput
                                    style={{ flex: 1 }}
                                    placeholder={currentTask.steps.length > 0 ? '下一步' : '添加步骤'}
                                    onSubmitEditing={e => {
                                        store.addTaskStep(currentTask, e.nativeEvent.text)
                                        e.nativeEvent.text = ''
                                    }}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.section} onPress={() => store.changeTaskMyday(currentTask)}>
                            {util.getIcon({
                                icon: 'sun',
                                iconFrom: 'Feather',
                                style: styles.icon,
                                color: currentTask.myDay ? 'blue' : undefined
                            })}
                            <Text style={currentTask.myDay ? styles.active : styles.unset}>
                                {currentTask.myDay ? '已' : ''}添加到 “我的一天”
                            </Text>
                            {currentTask.myDay && (
                                <View style={styles.delete}>
                                    {util.getIcon({
                                        icon: 'close',
                                        iconFrom: 'EvilIcons',
                                    })}
                                </View>
                            )}
                        </TouchableOpacity>
                        <View style={styles.schedule}>
                            <View style={styles.sectionItem}>
                                <TouchableOpacity onPress={this.reminderSheetShow}>
                                    {util.getIcon({
                                        icon: 'bell',
                                        iconFrom: 'Feather',
                                        style: styles.icon,
                                        color: currentTask.reminder && currentTask.reminder && new Date(currentTask.reminder.date).getTime() > Date.now() && !currentTask.completed ? 'blue' : undefined
                                    })}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.reminderSheetShow}>
                                    <Text style={[currentTask.reminder && new Date(currentTask.reminder.date).getTime() > Date.now() && !currentTask.completed ? styles.active : styles.unset, { width: 230 }]}>
                                        {currentTask.reminder ? `在 ${new Date(currentTask.reminder.date).getHours()}:${(new Date(currentTask.reminder.date).getMinutes() < 10 ? '0' : '') + new Date(currentTask.reminder.date).getMinutes()} 时提醒我` : '提醒我'}
                                    </Text>
                                    {
                                        currentTask.reminder && <Text style={[new Date(currentTask.reminder.date).getTime() > Date.now() && !currentTask.completed ? styles.active : styles.unset, { width: 230, fontSize: 12 }]}>{util.formatDate(currentTask.reminder.date)}</Text>
                                    }
                                </TouchableOpacity>
                                {currentTask.reminder && (
                                    <TouchableOpacity style={styles.delete} onPress={() => store.setTaskReminder(currentTask)}>
                                        {util.getIcon({
                                            icon: 'close',
                                            iconFrom: 'EvilIcons',
                                        })}
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.sectionItem}>
                                <TouchableOpacity onPress={this.dueDateSheetShow}>
                                    {util.getIcon({
                                        icon: 'calendar',
                                        iconFrom: 'AntDesign',
                                        style: styles.icon,
                                        color: currentTask.due_date
                                            ? new Date(currentTask.due_date).getTime() < new Date().setHours(0, 0, 0, 0)
                                                ? 'red'
                                                : 'blue'
                                            : undefined
                                    })}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.dueDateSheetShow}>
                                    {
                                        currentTask.due_date ? (
                                            <Text style={[new Date(currentTask.due_date).getTime() < new Date().setHours(0, 0, 0, 0) ? styles.invalid : styles.active, { width: 230 }]}>{util.formatDate(currentTask.due_date)} 到期</Text>
                                        ) : (
                                            <Text style={[styles.unset, { width: 230 }]}>添加截止日期</Text>
                                        )
                                    }
                                </TouchableOpacity>
                                {
                                    currentTask.due_date && (
                                        <TouchableOpacity style={styles.delete} onPress={() => store.setTaskDueDate(currentTask)}>
                                            {util.getIcon({
                                                icon: 'close',
                                                iconFrom: 'EvilIcons',
                                            })}
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                            <View style={styles.sectionItem}>
                                <TouchableOpacity onPress={this.recurrenceSheetShow}>
                                    {util.getIcon({
                                        icon: 'cycle',
                                        iconFrom: 'Entypo',
                                        style: styles.icon,
                                        color: currentTask.recurrence ? 'blue':undefined
                                    })}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.recurrenceSheetShow}>
                                    <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Text style={[currentTask.recurrence ? styles.active : styles.unset, { width: 230 }]}>{interval()}</Text>
                                        {currentTask.recurrence && currentTask.recurrence.days_of_week.length > 0 && (
                                            <Text style={{ color: 'grey' }}>{daysOfWeek().map((d, i, arr) => {
                                                if (i === arr.length-1) {
                                                    return d
                                                }
                                                return d + ', '
                                            })}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                {currentTask.recurrence && (
                                    <TouchableOpacity style={styles.delete} onPress={() => store.setTaskRecurrence(currentTask)}>
                                        {util.getIcon({
                                            icon: 'close',
                                            iconFrom: 'EvilIcons',
                                        })}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {currentList.sharing_status !== 'NotShare' && (
                            <TouchableOpacity style={styles.section} onPress={this.assignmentSheetShow}>
                                {!currentTask.assignment ? util.getIcon({
                                    icon: 'adduser',
                                    iconFrom: 'AntDesign',
                                    style: styles.icon
                                }) : (
                                    <View style={styles.avatar}>
                                        <Text style={{ color: 'white' }}>{users.find(u => u.user_id === currentTask.assignment.assignee)?.username.substring(0, 1)}</Text>
                                    </View>
                                )}
                                {currentTask.assignment ? (
                                    <>
                                        <Text>{currentTask.assignment.assignee === user_id? '已分配给你':users.find(u => u.user_id === currentTask.assignment.assignee)?.username}</Text>
                                        <TouchableOpacity style={styles.delete} onPress={() => store.assignTask(currentTask)}>
                                            {util.getIcon({
                                                icon: 'close',
                                                iconFrom: 'EvilIcons',
                                            })}
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={styles.unset}>分配给</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        {currentTask.linkedEntities.map((file, index) => (
                            <TouchableOpacity key={index} style={styles.fileItem}>
                                {util.getIcon({
                                    icon: 'download',
                                    iconFrom: 'Feather',
                                    style: styles.icon
                                })}
                                <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Text style={{ fontSize: 17, fontWeight: '300' }}>{file.display_name}</Text>
                                    <Text style={styles.unset}>{this.bytesToSize(file.preview.size)} · {this.mimeTypeTofileName(file.preview.content_type)}</Text>
                                </View>
                                <TouchableOpacity style={styles.delete} onPress={() => store.deleteLinkedEntitity(currentTask, file)}>
                                    {util.getIcon({
                                        icon: 'close',
                                        iconFrom: 'EvilIcons',
                                    })}
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.section} onPress={async () => {
                            const res = await DocumentPicker.pick({
                                type: [DocumentPicker.types.images]
                            })
                            store.fileUpload(res, currentTask)
                        }}>
                            {util.getIcon({
                                icon: 'paperclip',
                                iconFrom: 'AntDesign',
                                style: styles.icon
                            })}
                            <Text style={styles.unset}>添加文件</Text>
                        </TouchableOpacity>
                        <View style={styles.note}>
                            {currentTask.note ? (
                                <TouchableOpacity onPress={this.detailNoteEditShow}>
                                    <Text>{currentTask.note}</Text>
                                    <Text>更新于 {util.formatDate(currentTask.note_updated_at)}</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={this.detailNoteEditShow}>
                                    <Text style={[styles.unset, { marginBottom: 100 }]}>添加备注</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <View style={{ width: 20 }}/>
                        {currentTask.completed ? (
                            <Text>{`由 ${users.find(u => u.user_id === currentTask.completed_by)?.username} 完成于${util.formatDate(currentTask.completed_at)}`}</Text>
                        ) : (
                            <Text>{`由 ${users.find(u => u.user_id === currentTask.created_by)?.username} 创建于${util.formatDate(currentTask.created_at)}`}</Text>
                        )}
                        <TouchableHighlight onPress={() => {
                            store.deleteTask(currentTask._id)
                            this.props.navigation.goBack()
                        }}>
                            {util.getIcon({
                                icon: 'trash-2',
                                iconFrom: 'Feather',
                            })}
                        </TouchableHighlight>
                    </View>
                </View>
            </>

        );
    }
}

export default inject('store')(observer(TaskDetails))