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
import theme from '../../../common/theme'

let taskOptionThemeSheetRef = null

class TaskOptionThemeSheet extends Component {

    show = () => {
        if (taskOptionThemeSheetRef !== null) return taskOptionThemeSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (taskOptionThemeSheetRef !== null) return taskOptionThemeSheetRef.hide()
        return () => { }
    }

    render() {
        const { store, fatherSheet } = this.props
        const themes = ['blue', 'red', 'purple', 'skyblue', 'green']
        return (
            <ActionSheet
                ref={ref => taskOptionThemeSheetRef = ref}
                showBack
                backAction={() => {
                    this.hide()
                    fatherSheet()
                }}
                submitText={'完成'}
                submitAction={this.hide}
                translateY={150}
                bgColor={'white'}
                title={'选择主题'}
                content={
                    <View style={styles.modalActionContainer}>
                        {
                            themes.map((color, index) => (
                                <TouchableOpacity key={index} onPress={() => store.changeListTheme(store.currentList, color)}>
                                    <View style={[styles.theme, { backgroundColor: theme[color] }]}>
                                        {store.currentList && store.currentList.theme === color && <View style={styles.currentTheme}/>}
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                        
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(TaskOptionThemeSheet))

const windowWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    modalActionContainer: {
        padding: 10,
        display: 'flex',
        flexDirection: 'row'
    },
    theme: {
        margin: 5,
        width: 40,
        height: 40,
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    currentTheme: {
        backgroundColor: 'white',
        height: 16,
        width: 16,
        borderRadius: 8
    }
})