import { decorate, observable, action, computed } from 'mobx'
import AsyncStorage from '@react-native-community/async-storage'
import Mongoose from 'mongoose'
import { wsDomain, serverDomain } from '../common/config'
import {
    ChangeSchema,
    TaskSchema,
    ListSchema,
    AssignmentSchema,
    StepScheme,
    RecurrenceSchema,
    ReminderScheme,
    LinkedEntitiesSchema,
    PreviewSchema,
    ContentDescriptionSchema
} from '../db/schema'
import Realm from 'realm'
import * as RootNavigation from '../common/navigation'

class Store {
    realm = null
    ws = null
    checkTimer = null
    users = []
    tasks = []
    lists = []
    myday_showCompleted = true
    important_showCompleted = true
    planned_showCompleted = true
    assign_showCompleted = true
    inbox_showCompleted = true
    showTaskTitleInput = false
    currentList = null
    currentTask = null
    mydaySortType = 0
    mydaySortASC = true
    inboxSortType = 0
    inboxSortASC = true

    setShowTaskTitleInput = state => this.showTaskTitleInput = state

    setCurrentList = list => this.currentList = list

    setCurrentTask = task => this.currentTask = task

    copyRealmObject = (realmObj, type) => {
        const taskKeys = ['_id', 'title', 'local_id', 'list_id', 'created_by', 'created_at', 'completed', 'completed_at', 'completed_by', 'importance', 'myDay', 'steps', 'reminder', 'recurrence', 'due_date', 'assignment', 'note', 'note_updated_at', 'linkedEntities', 'position', 'today_position']
        const listKeys = ['_id', 'title', 'local_id', 'owner_id', 'created_at', 'show_completed', 'sharing_status', 'invitation_token', 'members', 'sort_type', 'sort_asc', 'theme', 'position']
        const stepKeys = ['title', 'completed', 'completed_at', 'created_at', 'position']
        const recurrenceKeys = ['days_of_week', 'interval', 'ignore', 'type']
        let a = {}
        try {
            switch(type) {
                case 'task':
                    taskKeys.map(k => {
                        if (k === 'steps' || k === 'linkedEntities') return a[k] = Array.from(realmObj[k])
                        a[k] = realmObj[k]
                        if (k === 'recurrence') {
                            if (realmObj[k] !== null) {
                                if (Object.prototype.toString.call(realmObj[k]['days_of_week']) === '[object Object]') {
                                    a[k]['days_of_week'] = Array.from(realmObj[k]['days_of_week'])
                                }
                            }
                        }
                    })
                    break
                case 'list':
                    listKeys.map(k => {
                        if (k === 'members') return a[k] = Array.from(realmObj[k])
                        a[k] = realmObj[k]
                    })
                    break
                case 'step':
                    let steps = []
                    realmObj.map(step => {
                        stepKeys.map(k => a[k] = step[k])
                        steps.push(a)
                        a = {}
                    })
                    return steps
                case 'recurrence':
                    recurrenceKeys.map(k => {
                        if (k === 'days_of_week') return a[k] = Array.from(realmObj[k])
                        a[k] = realmObj[k]
                    })
            }
            return a
        } catch (error) {
            console.log('CopyRealmObject: ' + error)
        }
    }

    updateCurrent = () => {
        if (!this.currentList) return
        const defaultList = ['myday', 'important', 'planned', 'assigned_to_me', 'inbox']
        let a = [...defaultList, ...this.lists.map(v => v._id)]
        if (defaultList.indexOf(this.currentList._id) > -1) {
            this.currentList = this[a.find(v => v === this.currentList._id)]
        } else {
            this.currentList = this.lists.find(l => l._id === this.currentList._id) || null
        }
        
        // update currentTask
        if (!this.currentTask) return
        this.currentTask = this.currentList.tasks.find(t => t._id === this.currentTask._id) || null
    }

    get myday() {
        return {
            _id: 'myday',
            title: '我的一天',
            defaultList: true,
            icon: 'sun',
            iconFrom: 'Feather',
            show_completed: this.myday_showCompleted,
            sort_type: this.mydaySortType,
            sort_asc: this.mydaySortASC,
            theme: 'skyblue',
            tasks: this.tasks.filter(task => task.myDay)
        }
    }
    get important() {
        return {
            _id: 'important',
            title: '重要',
            defaultList: true,
            icon: 'star-o',
            iconFrom: 'FontAwesome',
            sharing_status: 'NotShare',
            sort_type: -1,
            show_completed: this.important_showCompleted,
            theme: 'purple',
            tasks: this.tasks.filter(task => task.importance)
        }
    }
    get planned() {
        return {
            _id: 'planned',
            title: '已计划日程',
            defaultList: true,
            icon: 'calendar',
            iconFrom: 'Feather',
            sharing_status: 'NotShare',
            sort_type: -1,
            show_completed: this.planned_showCompleted,
            theme: 'red',
            tasks: this.tasks.filter(task => task.reminder || task.recurrence || task.due_date)
        }
    }
    get assigned_to_me() {
        try {
            let user_id
            AsyncStorage.getItem('user').then(u => user_id = JSON.parse(u))
            return {
                _id: 'assigned_to_me',
                title: '已分配给你',
                defaultList: true,
                icon: 'user',
                iconFrom: 'Feather',
                sharing_status: 'NotShare',
                sort_type: -1,
                show_completed: this.assign_showCompleted,
                theme: 'green',
                tasks: this.tasks.filter(task => task.assignment && task.assignment.assignee === user_id)
            }
        } catch (error) {
            console.log('getAssigned_to_me error: ' + error)
        }
    }
    get inbox() {
        return {
            _id: 'inbox',
            title: '任务',
            defaultList: true,
            icon: 'home',
            iconFrom: 'AntDesign',
            sharing_status: 'NotShare',
            sort_type: this.inboxSortType,
            sort_asc: this.inboxSortASC,
            show_completed: this.inbox_showCompleted,
            theme: 'blue',
            tasks: this.tasks.filter(task => task.list_id === 'inbox' || task.list_id === '000000000000000000000000')
        }
    }

    getLists = () => {
        try {
            let tasks = [], members = [], listss = []
            const lists = this.realm.objects('lists')
            lists.forEach(list => {
                tasks.push(this.tasks.filter(task => task.list_id === list._id))
                members.push(Array.from(list.members))
            })
            listss = JSON.parse(JSON.stringify(Array.from(lists)))
            listss.map(l => l = this.copyRealmObject(l, 'list'))
            listss.map((v, i) => {
                v.tasks = tasks[i]
                v.members = members[i]
            })
            this.lists = listss
        } catch (error) {
            console.log('getLists error: ' + error)
        }
    }

    getTasks = () => {
        try {
            let arr = []
            if (this.realm === null) this.initRealm()
            const tasks = this.realm.objects('tasks')
            tasks.forEach(task => arr.push(this.copyRealmObject(task, 'task')))
            this.tasks = arr
        } catch (error) {
            console.log('getTasks error: ' + error)
        }
    }

    getUsers = async () => {
        try {
            const user = await AsyncStorage.getItem('user')
            if (user) {
                const user_id = JSON.parse(user).user_id
                const token = await AsyncStorage.getItem('token')
                const res = await fetch(`${serverDomain}user/list?user_id=${user_id}`, {
                    headers: {
                        authorization: token
                    }
                })
                const { code, data } = await res.json()
                if (code === -1) return RootNavigation.navigate('login')
                else if (code === 1) this.users = data
                return code
            }
        } catch (error) {
            console.log('getUsers error: ' + error)
        }
    }

    addList = async title => {
        try {
            this.lists.slice().sort((a, b) => a.position - b.position).map(async (list, index) => {
                this.realm.write(() => {
                    this.realm.create('lists', { local_id: list.local_id, position: (index + 1) * 4096000 }, true)
                })
                this.setChange('update', 'list', JSON.stringify({
                    ...list,
                    position: (index + 1) * 4096000
                }))
            })
            const newId = mongoose.Types.ObjectId()
            const user = await AsyncStorage.getItem('user')
            let newList = {
                local_id: newId.toHexString(),
                _id: newId.toHexString(),
                title,
                owner_id: JSON.parse(user).user_id,
                created_at: new Date().toISOString(),
                show_completed: true,
                sharing_status: "NotShare",
                members: [],
                sort_type: 0,
                sort_asc: true,
                position: 0
            }
            this.realm.write(() => this.realm.create('lists', newList))
            this.setCurrentList(newList)
            this.setChange('add', 'list', JSON.stringify(newList))
            this.getLists()
        } catch (error) {
            console.log('AddList error: ' + error)
        }
    }

    deleteList = list_id => {
        try {
            let tasks = this.realm.objects('tasks').filtered(`list_id = '${list_id}'`)
            tasks.forEach(task => this.setChange('delete', 'task', task._id))
            const lists = this.realm.objects('lists').filtered(`_id = '${list_id}'`)
            this.realm.write(() => this.realm.delete(lists))
            this.setChange('delete', 'list', list_id)
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('DeleteList error: ' + error)
        }
    }

    cloneList = async list => {
        try {
            this.lists.slice().sort((a, b) => a.position - b.position).map(async (l, index) => {
                this.realm.write(() => {
                    this.realm.create('lists', { local_id: l.local_id, position: (index + 1) * 4096000 }, true)
                })
                this.setChange('update', 'list', JSON.stringify({
                    ...l,
                    position: (index + 1) * 4096000
                }))
            })
            const newListId = mongoose.Types.ObjectId()
            const user = await AsyncStorage.getItem('user')
            const newList = {
                ...list,
                local_id: newListId.toHexString(),
                _id: newListId.toHexString(),
                owner_id: JSON.parse(user).user_id,
                created_at: new Date().toISOString(),
                sharing_status: 'NotShare',
                invitation_token: null,
                members: [],
                sort_type: 0,
                sort_asc: true,
                position: 0
            }
            delete newList.tasks
            this.realm.write(() => this.realm.create('lists', newList))
            this.setChange('add', 'list', JSON.stringify(newList))

            list.tasks.slice().sort((a, b) => a.position - b.position).map(async (task, index) => {
                const newId = mongoose.Types.ObjectId()
                let newTask = {
                    ...JSON.parse(JSON.stringify(task)),
                    local_id: newId.toHexString(),
                    _id: newId.toHexString(),
                    list_id: newListId.toHexString(),
                    created_by: JSON.parse(user).user_id,
                    created_at: new Date().toISOString(),
                    position: index * 4096000
                }
                this.realm.write(() => this.realm.create('tasks', newTask))
                this.setChange('add', 'task', JSON.stringify(newTask))
            })
            this.getTasks()
            this.getLists()
        } catch (error) {
            console.log('CloneList error: ' + error)
        }
    }

    cloneInbox = async () => {
        try {
            this.lists.slice().sort((a, b) => a.position - b.position).map(async (list, index) => {
                this.realm.write(() => {
                    this.realm.create('lists', { local_id: list.local_id, position: (index + 1) * 4096000 }, true)
                })
                this.setChange('update', 'list', JSON.stringify({
                    ...list,
                    position: (index + 1) * 4096000
                }))
            })
            const newListId = mongoose.Types.ObjectId()
            const user = await AsyncStorage.getItem('user')
            const newList = {
                local_id: newListId.toHexString(),
                _id: newListId.toHexString(),
                title: '任务',
                owner_id: JSON.parse(user).user_id,
                created_at: new Date().toISOString(),
                show_completed: true,
                sharing_status: 'NotShare',
                members: [],
                sort_type: 0,
                sort_asc: true,
                position: 0
            }
            this.realm.write(() => this.realm.create('lists', newList))
            this.setChange('add', 'list', JSON.stringify(newList))

            this.inbox.tasks.slice().sort((a, b) => a.position - b.position).map(async (task, index) => {
                const newId = mongoose.Types.ObjectId()
                let newTask = {
                    ...JSON.parse(JSON.stringify(task)),
                    local_id: newId.toHexString(),
                    _id: newId.toHexString(),
                    list_id: newListId.toHexString(),
                    created_by: JSON.parse(user).user_id,
                    created_at: new Date().toISOString(),
                    position: index * 4096000
                }
                this.realm.write(() => this.realm.create('tasks', newTask))
                this.setChange('add', 'task', JSON.stringify(newTask))
            })
            this.getTasks()
            this.getLists()
        } catch (error) {
            console.log('CloneInbox error: ' + error)
        }
    }

    renameList = (list, title) => {
        try {
            const l = this.copyRealmObject(list, 'list')
            l.title = title
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('update', 'list', JSON.stringify(l))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('RenameList error: ' + error)
        }
    }

    changeListShowCompleted = async list => {
        if (list.defaultList) {
            switch (list._id) {
                case 'myday':
                    this.myday_showCompleted = !this.myday_showCompleted
                    break
                case 'important':
                    this.important_showCompleted = !this.important_showCompleted
                    break
                case 'planned':
                    this.planned_showCompleted = !this.planned_showCompleted
                    break
                case 'assigned_to_me':
                    this.assign_showCompleted = !this.planned_showCompleted
                    break
                case 'inbox':
                    this.inbox_showCompleted = !this.inbox_showCompleted
            }
        } else {
            let l = this.copyRealmObject(list, 'list')
            l.show_completed = !l.show_completed
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('update', 'list', JSON.stringify(l))
        }
        this.getLists()
        this.updateCurrent()
    }

    changeListSortType = async (list, sort_type) => {
        if (list.defaultList) {
            if (list._id === 'myday') {
                this.mydaySortType = sort_type
                this.mydaySortASC = true
            } else if (list._id === 'inbox') {
                this.inboxSortType = sort_type
                this.inboxSortASC = true
            }
        } else {
            let l = this.copyRealmObject(list, 'list')
            l.sort_type = sort_type
            l.sort_asc = true
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('update', 'list', JSON.stringify(l))
        }
        this.getLists()
        this.updateCurrent()
    }

    changeListSortAsc = async (list) => {
        if (list.defaultList) {
            if (list._id === 'myday') {
                this.mydaySortASC = !this.mydaySortASC
            } else if (list._id === 'inbox') {
                this.inboxSortASC = !this.inboxSortASC
            }
        } else {
            let l = this.copyRealmObject(list, 'list')
            l.sort_asc = !l.sort_asc
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('update', 'list', JSON.stringify(l))
        }
        this.getLists()
        this.updateCurrent()
    }


    openShare = async list => {
        try {
            const token = await AsyncStorage.getItem('token')
            const user = await AsyncStorage.getItem('user')
            if (user) {
                const user_id = JSON.parse(user).user_id
                const res = await fetch(`${serverDomain}list/share/open`, {
                    method: 'post',
                    headers: {
                        authorization: token,
                        Accept: 'application/json',
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id,
                        list_id: list._id
                    })
                })
                const { code, data } = await res.json()
                let l = this.copyRealmObject(list, 'list')
                delete l.tasks
                if (code === 1) {
                    l.sharing_status = 'Open'
                    l.invitation_token = data.invitation_token
                }
                this.realm.write(() => this.realm.create('lists', l, true))
                this.getLists()
                this.updateCurrent()
            }
        } catch (error) {
            console.log('OpenShare error: ' + error)
        }
    }

    limitShare = async list => {
        try {
            let l = this.copyRealmObject(list, 'list')
            delete l.tasks
            if (l.sharing_status === 'Limit') return this.openShare(l)
            l.sharing_status = 'Limit'
            l.invitation_token = null
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('update', 'list', JSON.stringify(l))
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('LimitShare error: ' + error)
        }
    }

    closeShare = async list => {
        try {
            let l = this.copyRealmObject(list, 'list')
            delete l.tasks
            l.sharing_status = 'NotShare'
            l.invitation_token = null
            l.members = []
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('closeShare', 'list', JSON.stringify(l))
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('CloseShare error: ' + error)
        }
    }

    removeMember = async (member_id, list) => {
        try {
            let l = this.copyRealmObject(list, 'list')
            delete l.tasks
            l.members = l.members.filter(member => member !== member_id)
            this.realm.write(() => this.realm.create('lists', l, true))
            this.setChange('removeMember', 'list', JSON.stringify(l))
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('RemoveMember error: ' + error)
        }
    }

    leaveList = async (user_id, list) => {
        try {
            let tasks = []
            this.realm.write(() => {
                do {
                    tasks = this.realm.objects('tasks').filtered(`list_id = '${list._id}'`)
                    if (tasks[0]) this.realm.delete(tasks[0])
                } while (tasks[0])
                const l = this.realm.objects('lists').filtered(`local_id = '${list.local_id}'`)
                this.realm.delete(l[0])
            })
            list.members = list.members.filter(member => member !== user_id)
            this.setChange('update', 'list', JSON.stringify(list))
            this.getTasks()
            this.getLists()
        } catch (error) {
            console.log('LeaveList error: ' + error)
        }
    }

    assignTask = async (task, assigner, assignee) => {
        let t = this.copyRealmObject(task, 'task')
        if (!assigner && !assignee) {
            t.assignment = null
        } else {
            t.assignment = {
                assigner,
                assignee
            }
        }
        this.realm.write(() => this.realm.create('tasks', t, true))
        this.setChange('update', 'task', JSON.stringify(t))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    addTask = async (fromList, title) => {
        try {
            const newId = mongoose.Types.ObjectId()
            const user = await AsyncStorage.getItem('user')
            let newTask = {
                local_id: newId.toHexString(),
                _id: newId.toHexString(),
                title,
                list_id: '000000000000000000000000',
                created_by: JSON.parse(user).user_id,
                created_at: new Date().toISOString(),
                completed: false,
                importance: false,
                myDay: false,
                steps: [],
                note: '',
                linkedEntities: [],
                position: 0,
                today_position: 0
            }
            switch (fromList) {
                case 'myday':
                    this.tasks.filter(task => task.myDay).sort((a, b) => a.today_position - b.today_position).map(async (task, index) => {
                        this.realm.write(() => {
                            this.realm.create('tasks', { local_id: task.local_id, today_position: (index + 1) * 4096000 }, true)
                        })
                        this.setChange('update', 'task', JSON.stringify({
                            ...task,
                            steps: Array.from(task.steps),
                            linkedEntities: Array.from(task.linkedEntities),
                            today_position: (index + 1) * 4096000
                        }))
                    })
                    newTask.myDay = true
                    break
                case 'important':
                    newTask.importance = true
                    break
                case 'planned':
                    newTask.due_date = new Date().toISOString().substring(0, 10)
                    break
                case 'inbox':
                    this.tasks.filter(task => task.list_id === '000000000000000000000000').sort((a, b) => a.position - b.position).map(async (task, index) => {
                        this.realm.write(() => {
                            this.realm.create('tasks', { local_id: task.local_id, position: (index + 1) * 4096000 }, true)
                        })
                        this.setChange('update', 'task', JSON.stringify({
                            ...task,
                            steps: Array.from(task.steps),
                            linkedEntities: Array.from(task.linkedEntities),
                            position: (index + 1) * 4096000
                        }))
                    })
                    break
                default:
                    this.tasks.filter(task => task.list_id === fromList).sort((a, b) => a.position - b.position).map(async (task, index) => {
                        this.realm.write(() => {
                            this.realm.create('tasks', { local_id: task.local_id, position: (index + 1) * 4096000 }, true)
                        })
                        this.setChange('update', 'task', JSON.stringify({
                            ...task,
                            steps: Array.from(task.steps),
                            linkedEntities: Array.from(task.linkedEntities),
                            position: (index + 1) * 4096000
                        }))
                    })
                    newTask.list_id = fromList
            }
            this.realm.write(() => this.realm.create('tasks', newTask))
            this.setChange('add', 'task', JSON.stringify(newTask))
            let tasks = this.currentList.tasks || []
            tasks.push(newTask)
            this.setCurrentList({
                ...this.currentList,
                tasks
            })
            this.getTasks()
            this.getLists()
        } catch (error) {
            console.log('AddTask error: ' + error)
        }
    }

    deleteTask = async task_id => {
        try {
            this.realm.write(() => {
                const tasks = this.realm.objects('tasks').filtered(`local_id = '${task_id}'`)
                this.realm.delete(tasks)
            })
            this.setChange('delete', 'task', task_id)
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('DeleteTask error: ' + error)
        }
    }

    renameTask = async (task, title) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.title = title
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('RenameTask error: ' + error)
        }
    }

    changeTaskCompleted = async task => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.completed = !t.completed
            if (t.completed) {
                const user = await AsyncStorage.getItem('user')
                t.completed_at = new Date().toISOString()
                t.completed_by = JSON.parse(user).user_id
                if (t.recurrence !== null) {
                    t.recurrence = this.copyRealmObject(t.recurrence, 'recurrence')
                }
                if (t.recurrence && !t.recurrence.ignore) {
                    const newId = mongoose.Types.ObjectId()
                    let newTask = {
                        ...t,
                        recurrence: {
                            ...t.recurrence,
                            days_of_week: Array.from(t.recurrence.days_of_week)
                        },
                        local_id: newId.toHexString(),
                        _id: newId.toHexString(),
                        created_by: JSON.parse(user).user_id,
                        created_at: new Date().toISOString(),
                        completed: false,
                        completed_at: null,
                        completed_by: null,
                    }
                    const date = new Date(newTask.due_date)
                    switch(newTask.recurrence.type) {
                        case 'Daily':
                            newTask.due_date = new Date(date.getTime()+newTask.recurrence.interval*24*3600*1000).toISOString()
                            break
                        case 'Weekly':
                            if (newTask.recurrence.days_of_week.length > 0) {
                                // 工作日
                                const due_day = date.getDay()
                                if (due_day !== 5 && due_day !== 6) {
                                    newTask.due_date = new Date(date.getTime() + 24*3600*1000).toISOString()
                                } else {
                                    if (due_day === 5) {
                                        newTask.due_date = new Date(date.getTime() + 3*24*3600*1000).toISOString()
                                    } else {
                                        newTask.due_date = new Date(date.getTime() + 2*24*3600*1000).toISOString()
                                    }
                                }
                            } else {
                                newTask.due_date = new Date(date.getTime()+newTask.recurrence.interval*7*24*3600*1000).toISOString()
                            }
                            break
                        case 'Monthly':
                            if (date.getMonth() == 11) {
                                newTask.due_date = new Date(date.getFullYear() + 1, 0, date.getDate()).toISOString()
                            } else {
                                newTask.due_date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()).toISOString()
                            }
                            break
                        case 'Yearly':
                            newTask.due_date = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate())
                    }
                    this.realm.write(() => this.realm.create('tasks', JSON.parse(JSON.stringify(newTask))))
                    this.setChange('add', 'task', JSON.stringify(newTask))
                    t.recurrence.ignore = true
                }
            } else {
                t.completed_at = null
                t.completed_by = null
            }
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('ChangeTaskCompleted error: ' + error)
        }
    }

    changeTaskImportance = async task => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.importance = !t.importance
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('ChangeTaskImportance error: ' + error)
        }
    }

    changeTaskMyday = async task => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.myDay = !t.myDay
            t.today_position = 0
            this.tasks.slice().sort((a, b) => a.today_position-b.today_position).map(async (task, index) => {
                let t = this.copyRealmObject(task, 'task')
                t.today_position = (index + 1) * 4096000
                this.realm.write(() => this.realm.create('tasks', t, true))
                this.setChange('update', 'task', JSON.stringify(t))
            })
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('ChangeTaskMyday: ' + error)
        }
    }

    addTaskStep = async (task, title) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.steps.slice().sort((a, b) => a.position-b.position).map((step, index) => {
                step.position = (index + 1) * 4069000
            })
            t.steps.push({
                title,
                completed: false,
                completed_at: null,
                created_at: new Date().toISOString(),
                position: 0
            })
            console.log(JSON.parse(JSON.stringify(t.steps)))
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('AddTaskStep error: ' + error)
        }
    }
    

    deleteTaskStep = async (task, step) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.steps = t.steps.filter(s => JSON.stringify(s) !== JSON.stringify(step))
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('DeleteTaskStep error: ' + error)
        }
    }

    renameStep = async (task, title, index) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.steps = this.copyRealmObject(t.steps, 'step')
            t.steps[index].title = title
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('RenameStep: ' + error)
        }
    }

    changeStepCompleted = async (task, step) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.steps = this.copyRealmObject(t.steps, 'step')
            t.steps = t.steps.map(s => {
                if (JSON.stringify(s) === JSON.stringify(step)) {
                    s.completed = !step.completed
                    if (s.completed) {
                        s.completed_at = new Date().toISOString()
                    } else {
                        s.completed_at = null
                    }
                }
                return s
            })

            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('ChangeStepCompleted error: ' + error)
        }
    }

    setTaskNote = async (task, note) => {
        try {
            let t = this.copyRealmObject(task, 'task')
            t.note = note
            if (t.note === '') {
                t.note_updated_at = null
            } else {
                t.note_updated_at = new Date().toISOString()
            }
            this.realm.write(() => this.realm.create('tasks', t, true))
            this.setChange('update', 'task', JSON.stringify(t))
            this.getTasks()
            this.getLists()
            this.updateCurrent()
        } catch (error) {
            console.log('SetTaskNote error: ' + error)
        }
    }

    setTaskReminder = async (task, ISODate) => {
        let t = this.copyRealmObject(task, 'task')
        if (!ISODate) {
            t.reminder = null
        } else {
            const reminder = {
                type: '',
                snooze_time: 0,
                snoozed_at: '',
                is_snoozed: false,
                date: ISODate
            }
            t.reminder = reminder
        }
        this.realm.write(() => this.realm.create('tasks', t, true))
        this.setChange('update', 'task', JSON.stringify(t))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    setTaskDueDate = async (task, ISODate) => {
        let t = this.copyRealmObject(task, 'task')
        if (!ISODate) {
            // 移除截止日期
            t.due_date = null
            t.recurrence = null
        } else {
            t.due_date = ISODate
        }
        this.realm.write(() => this.realm.create('tasks', t, true))
        this.setChange('update', 'task', JSON.stringify(t))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    setTaskRecurrence = async (task, recurrence_type, interval=1) => {
        let t = this.copyRealmObject(task, 'task')
        if (!recurrence_type) t.recurrence = null
        switch(recurrence_type) {
            case 1:
                t.recurrence = {
                    days_of_week: [],
                    interval,
                    type: 'Daily',
                    ignore: false
                }
                t.due_date = t.due_date || new Date().toISOString()
                break
            case 2:
                t.recurrence = {
                    days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    interval,
                    type: 'Weekly',
                    ignore: false
                }
                let due_date = t.due_date ? new Date(t.due_date) : new Date()
                // 工作日
                switch (due_date.getDay()) {
                    case 0:
                        due_date = new Date(due_date.getTime() + 24 * 60 * 60 * 1000).toISOString()
                        break
                    case 6:
                        due_date = new Date(due_date.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
                        break
                }
                t.due_date = due_date
                break
            case 3:
                t.recurrence = {
                    days_of_week: [],
                    interval,
                    type: 'Weekly',
                    ignore: false
                }
                t.due_date = t.due_date || new Date().toISOString()
                break
            case 4:
                t.recurrence = {
                    days_of_week: [],
                    interval,
                    type: 'Monthly',
                    ignore: false
                }
                t.due_date = t.due_date || new Date().toISOString()
                break
            case 5:
                t.recurrence = {
                    days_of_week: [],
                    interval,
                    type: 'Yearly',
                    ignore: false
                }
                t.due_date = t.due_date || new Date().toISOString()
                break
        }
        if (typeof t.due_date !== 'string') t.due_date = t.due_date.toISOString()
        this.realm.write(() => this.realm.create('tasks', t, true))
        this.setChange('update', 'task', JSON.stringify(t))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    initRealm = () => {
        this.realm = new Realm({
            schema: [
                ListSchema,
                TaskSchema,
                ChangeSchema,
                StepScheme,
                ReminderScheme,
                RecurrenceSchema,
                AssignmentSchema,
                LinkedEntitiesSchema,
                PreviewSchema,
                ContentDescriptionSchema
            ]
        })
    }

    initWs = async () => {
        const user = await AsyncStorage.getItem('user')
        if (!user) return
        try {
            this.ws = new WebSocket(wsDomain)
            this.ws.onopen = async () => {
                this.ws.id = Date.now()
                this.ws.send(JSON.stringify({
                    type: 'identity',
                    data: {
                        id: this.ws.id,
                        user_id: JSON.parse(user).user_id
                    }
                }))
                this.realm.write(() => {
                    const changes = this.realm.objects('changes')
                    let arr = []
                    changes.forEach(v => arr.push(v))
                    if (changes.length > 0) {
                        this.ws.send(JSON.stringify({
                            type: 'update',
                            data: arr
                        }))
                    }
                })
                this.ws.send(JSON.stringify({
                    type: 'fetch',
                    data: JSON.parse(user).user_id
                }))
                clearInterval(this.checkTimer)
                this.checkTimer = setInterval(this.checkConnecting, 50000)
            }
            this.ws.onmessage = msg => this.onReceiveMessage(msg)
            this.ws.onerror = e => {
                clearInterval(this.checkTimer)
                console.log('WebSocket error: ' + e.target.error)
                this.checkConnecting()
            }
            this.ws.onclose = () => {
                clearInterval(this.checkTimer)
                this.ws = null
            }
        } catch (error) {
            console.log('initWs error: ' + error)
        }
    }

    onReceiveMessage = async raw => {
        let json;
        try {
            json = JSON.parse(raw.data);
        } catch (e) {
            json = {};
        }
        switch (json.type) {
            case 'pong':
                console.log(`[${new Date().toTimeString()}] [connectivity] Connection is OK`)
                break
            case 'fetchSuccess':
                try {
                    const oldTasks = this.realm.objects('tasks')
                    const oldLists = this.realm.objects('lists')
                    this.realm.write(() => {
                        oldTasks.map(async task => {
                            if (!json.data.tasks.map(t => t._id).includes(task._id)) {
                                this.realm.delete(task)
                            }
                        })
                        oldLists.map(async list => {
                            if (!json.data.lists.map(t => t._id).includes(list._id)) {
                                this.realm.delete(list)
                            }
                        })
                        json.data.lists.map(async list => {
                            list.local_id = mongoose.Types.ObjectId(list._id).toHexString()
                            this.realm.create('lists', list, oldLists.map(l => l._id).includes(list._id))
                        })
                        json.data.tasks.map(async task => {
                            task.local_id = mongoose.Types.ObjectId(task._id).toHexString()
                            this.realm.create('tasks', task, oldTasks.map(t => t._id).includes(task._id))
                        })
                    })
                    this.getTasks()
                    this.getLists()
                } catch (error) {
                    console.log('onReceiveMessage fetchSuccess error: ' + error)
                }
                break
            case 'updateSuccess':
                try {
                    this.realm.write(() => {
                        const changes = this.realm.objects('changes').filtered(`time = ${json.data}`)
                        this.realm.delete(changes)
                    })
                } catch (error) {
                    console.log('onReceiveMessage updateSuccess error: ' + error)
                }
                break
            case 'update':
                const tableName = json.data.target_type === 'list' ? 'lists' : 'tasks'
                switch (json.data.change_type) {
                    case 'add':
                        this.realm.write(() => {
                            this.realm.create(tableName, json.data.target)
                        })
                        break
                    case 'update':
                        try {
                            this.realm.write(() => this.realm.create(tableName, json.data.target, true))
                        } catch (error) {
                            console.log('onReceiveMessage update update error: ' + error)
                        }
                        break
                    case 'delete':
                        try {
                            this.realm.write(() => {
                                console.log(tableName, json.data)
                                const target = this.realm.objects(tableName).filtered(`local_id = '${json.data.target}'`)
                                this.realm.delete(target[0])
                            })
                        } catch (error) {
                            console.log('onReceiveMessage update delete: ' + error)
                        }
                }
                this.getTasks()
                this.getLists()
                this.updateCurrent()
        }
    }

    checkConnecting = a => {
        console.log(`[${new Date().toTimeString()}] [connectivity] Checking connection`)
        if (this.ws.readyState !== this.ws.CONNECTING) {
            this.ws.send(JSON.stringify({ type: 'ping' }))
        }
        if (this.ws.readyState !== this.ws.OPEN) {
            console.log(`[${new Date().toTimeString()}] [connectivity] connection terminated, try to reconnecting...`)
            setTimeout(this.initWs, 3000)
        }
    }

    setChange = (change_type, target_type, target) => {
        if (this.ws === null) this.initWs()
        const now = Date.now()
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'update',
                data: [{
                    change_type,
                    target_type,
                    target,
                    time: now,
                    ws_id: this.ws.id
                }]
            }))
        }
        this.realm.write(() => {
            this.realm.create('changes', {
                change_type,
                target_type,
                target,
                time: now,
                ws_id: this.ws.id
            })
        })
    }

    fileUpload = async (file, task) => {
        const token = await AsyncStorage.getItem('token')
        const user = await AsyncStorage.getItem('user')
        const user_id = JSON.parse(user).user_id
        let form = new FormData()
        form.append('file', file)
        const res = await fetch(`${serverDomain}task/uploadFile?user_id=${user_id}`, {
            method: 'post',
            headers: {
                authorization: token
            },
            body: form,
        })

        const { code, msg, data } = await res.json()
        if (code === 1) this.addLinkedEntities(file, data, this.copyRealmObject(task, 'task'))
    }

    addLinkedEntities = async (file, uploadResult, task) => {
        const linkedEntities = {
            weblink: uploadResult.url,
            extension: uploadResult.key.split(".").pop().toUpperCase(),
            display_name: uploadResult.key,
            preview: {
                size: file.size,
                content_type: file.type,
                content_description: {
                    label: uploadResult.key.split(".").pop().toUpperCase()
                }
            }
        }
        if (!task.linkedEntities) task.linkedEntities = []
        task.linkedEntities.push(linkedEntities)
        this.realm.write(() => this.realm.create('tasks', task, true))
        this.setChange('update', 'task', JSON.stringify(task))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    deleteLinkedEntitity = async (task, file) => {
        let t = this.copyRealmObject(task, 'task')
        t.linkedEntities = t.linkedEntities.filter(l => l.display_name !== file.display_name)
        this.realm.write(() => this.realm.create('tasks', t, true))
        this.setChange('update', 'task', JSON.stringify(task))
        this.getTasks()
        this.getLists()
        this.updateCurrent()
    }

    changeListTheme = async (list, theme) => {
        let l = this.copyRealmObject(list, 'list')
        l.theme = theme
        this.realm.write(() => this.realm.create('lists', l, true))
        this.setChange('update', 'list', JSON.stringify(l))
        this.getLists()
        this.updateCurrent()
    }
}

decorate(Store, {
    realm: observable,
    ws: observable,
    users: observable,
    lists: observable,
    tasks: observable,
    myday_showCompleted: observable,
    important_showCompleted: observable,
    planned_showCompleted: observable,
    assign_showCompleted: observable,
    inbox_showCompleted: observable,
    currentList: observable,
    currentTask: observable,
    showTaskTitleInput: observable,
    mydaySortASC: observable,
    mydaySortType: observable,
    inboxSortASC: observable,
    inboxSortType: observable,
    setShowTaskTitleInput: action,
    myday: computed,
    important: computed,
    planned: computed,
    assigned_to_me: computed,
    inbox: computed,
    getLists: action,
    getTasks: action,
    getUsers: action,
    addList: action,
    deleteList: action,
    cloneList: action,
    cloneInbox: action,
    changeListShowCompleted: action,
    changeListSortType: action,
    changeListSortAsc: action,
    renameList: action,
    openShare: action,
    limitShare: action,
    closeShare: action,
    assignTask: action,
    removeMember: action,
    leaveList: action,
    addTask: action,
    deleteTask: action,
    renameTask: action,
    changeTaskCompleted: action,
    changeTaskImportance: action,
    changeTaskMyday: action,
    addTaskStep: action,
    deleteTaskStep: action,
    renameStep: action,
    changeStepCompleted: action,
    setTaskNote: action,
    setCurrentList: action,
    setCurrentTask: action,
    initRealm: action,
    initWs: action,
    onReceiveMessage: action,
    checkConnecting: action,
    setChange: action,
    setTaskReminder: action,
    setTaskDueDate: action,
    setTaskRecurrence: action,
    fileUpload: action,
    addLinkedEntities: action,
    deleteLinkedEntitity: action,
    changeListTheme: action
})

export default new Store()