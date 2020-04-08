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
import AsyncStorage from '@react-native-community/async-storage'
import * as RootNavigation from '../../../common/navigation'

let settingSheetRef = null

class SettingSheet extends Component {

    show = () => {
        if (settingSheetRef !== null) return settingSheetRef.show()
        return () => { }
    }
    
    hide = () => {
        if (settingSheetRef !== null) return settingSheetRef.hide()
        return () => { }
    }

    logOut = async () => {
        const { ws } = this.props.store
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
        if (!ws) ws.close()
        RootNavigation.navigate('login')
    }

    render() {
        return (
            <ActionSheet
                ref={ref => settingSheetRef = ref}
                submitText={'完成'}
                submitAction={this.hide}
                translateY={150}
                title={'设置'}
                content={
                    <View style={styles.modalActionContainer}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            this.hide()
                            this.logOut()
                        }}>
                            <Text style={styles.close}>注销</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(SettingSheet))

const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    modalActionContainer: {
        // paddingHorizontal: 15
    },
    actionItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: windowWidth,
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginBottom: 20,
        backgroundColor: 'white'
    },
    close: {
        color: 'red',
        fontSize: 16
    }
})