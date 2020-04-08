import React, { Component } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
} from 'react-native';
import { inject, observer } from 'mobx-react'
import TaskItem from '../../components/taskItem/index'
import util from '../../common/util'
import theme from '../../common/theme'

class Tasks extends Component {

    constructor(props) {
        super(props)
        this.swipeValueX = 0
    }

    componentDidMount() {
        if (this.props.route.params && this.props.route.params.inputAutoFocus) {
            this.changeTitleInput()
        }
    }

    changeTitleInput = () => {
        const { currentList, store } = this.props
        const { showTaskTitleInput, setShowTaskTitleInput } = store
        if (currentList && currentList.defaultList) return
        setShowTaskTitleInput(!showTaskTitleInput)
    }

    render() {
        const { route, store, navigation } = this.props
        const { currentList, showTaskTitleInput } = store
        const sortType = {
            1: '重要性',
            2: '截止日期',
            3: '是否添加到 “我的一天”',
            4: '完成状态',
            5: '字母顺序',
            6: '创建日期'
        }
        if (!currentList) return null
        const getSortedList = () => {
            if (!currentList.tasks) return []
            if (currentList.defaultList && currentList._id !== 'myday' && currentList._id !== 'inbox') return currentList.tasks
            switch (currentList.sort_type) {
                case 0:
                    if (currentList._id === 'myday') {
                        return currentList.tasks.slice().sort((a, b) => b.today_position - a.today_position)
                    } else {
                        return currentList.tasks.slice().sort((a, b) => b.position - a.position)
                    }
                case 1:
                    // 重要性: 重要性权重最高
                    if (currentList.sort_asc) {
                        return [
                            ...currentList.tasks.filter(l => l.importance).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => !l.importance).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    } else {
                        return [
                            ...currentList.tasks.filter(l => !l.importance).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => l.importance).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    }
                case 2:
                    // 截止日期：设置截止日期的未完成的 > 未设置截止日期的未完成的 > 设置截止日期的已完成的 > 未设置截止日期的已完成的，截止日期相同完成属性相同的，看 position 或 today_position
                    if (currentList.sort_asc) {
                        return [
                            // 设置截止日期的未完成的
                            ...currentList.tasks.filter(l => !l.completed && l.due_date).sort((a, b) => {
                                if (new Date(a.due_date).getTime() !== new Date(b.due_date).getTime()) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position

                            }),
                            // 未设置截止日期的未完成的
                            ...currentList.tasks.filter(l => !l.completed && !l.due_date).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            // 设置截止日期的已完成的
                            ...currentList.tasks.filter(l => l.completed && l.due_date).sort((a, b) => {
                                if (new Date(a.due_date).getTime() !== new Date(b.due_date).getTime()) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            // 未设置截止日期的已完成的
                            ...currentList.tasks.filter(l => l.completed && !l.due_date).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    } else {
                        return [
                            ...currentList.tasks.filter(l => !l.completed && l.due_date).sort((a, b) => {
                                if (new Date(a.due_date).getTime() !== new Date(b.due_date).getTime()) return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position

                            }),
                            ...currentList.tasks.filter(l => !l.completed && !l.due_date).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => l.completed && l.due_date).sort((a, b) => {
                                if (new Date(a.due_date).getTime() !== new Date(b.due_date).getTime()) return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => l.completed && !l.due_date).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    }
                case 3:
                    // 已添加到我的一天：已添加到我的一天 > 未添加到我的一天，其次看 position 或 today_position
                    if (currentList.sort_asc) {
                        return [
                            ...currentList.tasks.filter(l => l.myDay).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => !l.myDay).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    } else {
                        return [
                            ...currentList.tasks.filter(l => !l.myDay).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => l.myDay).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    }
                case 4:
                    // 已完成
                    if (currentList.sort_asc) {
                        return [
                            ...currentList.tasks.filter(l => !l.completed).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => l.completed).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    } else {
                        return [
                            ...currentList.tasks.filter(l => l.completed).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            }),
                            ...currentList.tasks.filter(l => !l.completed).sort((a, b) => {
                                if (currentList._id === 'myday') return b.today_position - a.today_position
                                return b.position - a.position
                            })
                        ]
                    }
                // case 5:
                //     // 字母顺序：数字按第一位数字顺序排列，字母按字母顺序，汉字按拼音首字母顺序
                //     break
                case 6:
                    // 创建日期: 越新的任务权重越高
                    if (currentList.sort_asc) {
                        return currentList.tasks.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    } else {
                        return currentList.tasks.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    }
            }
        }
        return (
            <View style={[styles.background, currentList.theme ? { backgroundColor: theme[currentList.theme] } : { backgroundColor: theme.grey }]}>
                <View style={styles.top}>
                    {
                        showTaskTitleInput ? (
                            <TextInput
                                style={[styles.titleRename, currentList.theme ? { backgroundColor: util.LightenDarkenColor(theme[currentList.theme], -20) } : { backgroundColor: util.LightenDarkenColor(theme.grey, -20) }]}
                                placeholder="添加任务"
                                placeholderTextColor='white'
                                selectionColor='white'
                                autoFocus={true}
                                defaultValue={currentList.title || ''}
                                onSubmitEditing={e => route.params && route.params.inputAutoFocus
                                    ? store.addList(e.nativeEvent.text)
                                    : store.renameList(currentList, e.nativeEvent.text)
                                }
                                onBlur={this.changeTitleInput}
                            />
                        ) : <Text style={styles.title} onPress={this.changeTitleInput}>{currentList ? currentList.title : ''}</Text>
                    }
                    {
                        currentList.sort_type > 0 && (
                            <View style={styles.sortContainer}>
                                <TouchableOpacity
                                    style={[styles.sortWrapper, currentList.theme ? { backgroundColor: util.LightenDarkenColor(theme[currentList.theme], -12) } : { backgroundColor: util.LightenDarkenColor(theme.grey, -12) }]}
                                    onPress={() => store.changeListSortAsc(currentList, !currentList.sort_asc)}
                                >
                                    <Text style={{ color: 'white' }}>{`按${sortType[currentList.sort_type]}排列 `}</Text>
                                    {util.getIcon({
                                        icon: currentList.sort_asc ? 'up' : 'down',
                                        iconFrom: 'AntDesign',
                                        color: 'white',
                                        size: 15
                                    })}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.sortWrapper, currentList.theme ? { backgroundColor: util.LightenDarkenColor(theme[currentList.theme], -12) } : { backgroundColor: util.LightenDarkenColor(theme.grey, -12) }]}
                                    onPress={() => store.changeListSortType(currentList, 0)}
                                >
                                    {util.getIcon({
                                        icon: 'close',
                                        iconFrom: 'AntDesign',
                                        color: 'white',
                                        size: 18
                                    })}
                                </TouchableOpacity>
                            </View>
                        )
                    }
                </View>
                <ScrollView style={styles.scrollView}>{getSortedList().filter(t => !t.completed || currentList.show_completed).map(task => <TaskItem key={task._id} task={task} currentList={currentList} navigation={navigation}/>)}</ScrollView>
                {
                    !showTaskTitleInput && (
                        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={0} style={[styles.input, currentList.theme ? { backgroundColor: theme[currentList.theme] } : { backgroundColor: theme.grey }]}>
                            <View style={[styles.baseAdd, currentList.theme ? { backgroundColor: util.LightenDarkenColor(theme[currentList.theme], -20) } : { backgroundColor: util.LightenDarkenColor(theme.grey, -20) }]}>
                                {util.getIcon({
                                    icon: 'add',
                                    iconFrom: 'MaterialIcons',
                                    size: 32,
                                    color: 'white',
                                    style: styles.addIcon
                                })}
                                <TextInput
                                    ref={input => this.textInput = input}
                                    style={[styles.textInput, { fontSize: 16 }]}
                                    placeholder="添加任务"
                                    placeholderTextColor='white'
                                    onSubmitEditing={e => {
                                        store.addTask(currentList._id, e.nativeEvent.text)
                                        this.textInput.clear()
                                    }}
                                />
                            </View>
                        </KeyboardAvoidingView>
                    )
                }
            </View>
        );
    }
}

export default inject('store')(observer(Tasks))

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    background: {
        height: windowHeight,
        width: windowWidth
    },
    top: {
        marginBottom: 15
    },
    title: {
        fontSize: 30,
        marginLeft: 10,
        fontWeight: '900',
        color: 'white',
        paddingHorizontal: 5
    },
    input: {
        flexBasis: 155,
        paddingHorizontal: 10
    },
    baseAdd: {
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    addIcon: {
        paddingLeft: 10,
        paddingRight: 5,
    },
    titleRename: {
        marginHorizontal: 10,
        fontSize: 30,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 6,
        color: 'white',
        marginBottom: 5
    },
    textInput: {
        height: 60,
        flex: 1,
        paddingRight: 10,
        color: 'white'
    },
    sortContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    sortWrapper: {
        borderRadius: 5,
        marginRight: 5,
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sort: {
        color: 'white'
    },
    scrollView: {
        paddingHorizontal: 10
    }
})