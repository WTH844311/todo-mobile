import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    Clipboard
} from 'react-native'
import { inject, observer } from 'mobx-react'
import ActionSheet from '../index'
import util from '../../../common/util'
import { domain } from '../../../common/config'

const windowWidth = Dimensions.get('window').width
let shareRef = null

class ShareLinkSheet extends Component {

    show = () => {
        if (shareRef !== null) return shareRef.show()
        return () => {}
    }

    hide = () => {
        if (shareRef !== null) return shareRef.hide()
        return () => {}
    }

    render() {
        const { currentList } = this.props.store
        return (
            <ActionSheet
                ref={ref => shareRef = ref}
                submitText='关闭'
                submitAction={this.hide}
                translateY={200}
                title='分享'
                content={
                    <View style={styles.modalActionContainer}>
                        <TouchableOpacity style={styles.item} onPress={() => {
                            Clipboard.setString(domain + 'sharing/' + currentList.invitation_token)
                            this.hide()
                        }}>
                            {util.getIcon({
                                icon: 'copy1',
                                iconFrom: 'AntDesign',
                                size: 35,
                                color: 'black'
                            })}
                            <Text style={styles.item_text}>拷贝</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        )
    }
}

export default inject('store')(observer(ShareLinkSheet))

const styles = StyleSheet.create({
    modalActionContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: windowWidth,
    },
    item: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        margin: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    item_text: {
        paddingTop: 8
    }
})