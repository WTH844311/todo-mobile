import {
    Dimensions,
    StyleSheet
} from 'react-native'

const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    rowBack: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 6,
        marginVertical: 1,
    },
    rowBack_left: {
        display: 'flex',
        flexDirection: 'row',
    },
    left_myday: {
        backgroundColor: 'blue',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    left_move: {
        backgroundColor: 'orange',
        paddingVertical: 17,
        paddingHorizontal: 20,
    },
    right_delete: {
        backgroundColor: 'red',
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    taskItem: {
        borderRadius: 6,
        marginVertical: 1,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    taskItem_middle: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
        height: 58,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    metadata: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    metadataItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    metadataTitle: {
        fontSize: 12,
        color: 'grey'
    },
    metadataIcon: {
        paddingHorizontal: 3
    }
})

export default styles