import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Dimensions,
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ActionSheet from '../index'
import { TextInput } from 'react-native-gesture-handler'

const windowWidth = Dimensions.get('window').width
let detailNoteEditSheetRef = null

class DetailNoteEditSheet extends Component {

    state = {
        noteInputValue: this.props.store.currentTask.note || ''
    }

    show = () => {
        if (detailNoteEditSheetRef !== null) return detailNoteEditSheetRef.show()
        return () => { }
    }

    hide = () => {
        if (detailNoteEditSheetRef !== null) return detailNoteEditSheetRef.hide()
        return () => { }
    }

    render() {
        const { currentTask, setTaskNote } = this.props.store
        return (
            <ActionSheet
                ref={ref => detailNoteEditSheetRef = ref}
                submitText={'完成'}
                submitAction={() => {
                    // submit
                    setTaskNote(currentTask, this.state.noteInputValue)
                    this.hide()
                }}
                translateY={700}
                title={'备注'}
                subTitle={'明天的任务'}
                bgColor='white'
                content={
                    <View style={styles.modalActionContainer}>
                        <TextInput
                            multiline
                            placeholder='添加备注'
                            maxLength={255}
                            style={{height: 400, textAlignVertical: 'top'}}
                            value={this.state.noteInputValue}
                            onChangeText={text => this.setState({ noteInputValue: text })}
                        />
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(DetailNoteEditSheet))

const styles = StyleSheet.create({
    modalActionContainer: {
        paddingTop: 20,
        paddingHorizontal: 10,
        width: windowWidth,
    }
})