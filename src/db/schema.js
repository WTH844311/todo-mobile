export const ListSchema = {
    name: 'lists',
    primaryKey: 'local_id',
    properties: {
        _id: 'string',
        title: 'string',
        local_id: 'string',
        owner_id: 'string',
        created_at: 'string',
        show_completed: 'bool',
        sharing_status: 'string',
        invitation_token: 'string?',
        members: 'string?[]',
        sort_type: 'int',
        sort_asc: 'bool',
        theme: 'string?',
        position: 'int'
    }
}

export const StepScheme = {
    name: 'step',
    properties: {
        title: 'string',
        completed: 'bool',
        completed_at: 'string?',
        created_at: 'string',
        position: 'int'
    }
}

export const ReminderScheme = {
    name: 'reminder',
    properties: {
        type: 'string?',
        snooze_time: 'int?',
        snoozed_at: 'string?',
        is_snoozed: 'bool?',
        date: 'string?'
    }
}

export const RecurrenceSchema = {
    name: 'recurrence',
    properties: {
        days_of_week: 'string?[]',
        interval: 'int',
        type: 'string',
        ignore: 'bool'
    }
}

export const AssignmentSchema = {
    name: 'assignment',
    properties: {
        assignee: 'string',
        assigner: 'string'
    }
}

export const LinkedEntitiesSchema = {
    name: 'linkedEntities',
    properties: {
        weblink: 'string',
        extension: 'string',
        display_name: 'string',
        preview: 'preview'
    }
}

export const PreviewSchema = {
    name: 'preview',
    properties: {
        size: 'int',
        content_type: 'string',
        content_description: 'contentDescription'
    }
}

export const ContentDescriptionSchema = {
    name: 'contentDescription',
    properties: {
        label: 'string'
    }
}

export const TaskSchema = {
    name: 'tasks',
    primaryKey: 'local_id',
    properties: {
        _id: 'string',
        title: 'string',
        local_id: 'string',
        list_id: 'string',
        created_by: 'string',
        created_at: 'string',
        completed: 'bool',
        completed_at: 'string?',
        completed_by: 'string?',
        importance: 'bool',
        myDay: 'bool',
        steps: { type: 'list', objectType: 'step' },
        reminder: 'reminder',
        recurrence: 'recurrence',
        due_date: { type: 'string', optional: true },
        assignment: 'assignment',
        note: 'string?',
        note_updated_at: 'string?',
        linkedEntities: { type: 'list', objectType: 'linkedEntities' },
        position: 'int',
        today_position: 'int'
    }
}

export const ChangeSchema = {
    name: 'changes',
    primaryKey: 'time',
    properties: {
        change_type: 'string',
        target_type: 'string',
        target: 'string',
        time: 'int?'
    }
}