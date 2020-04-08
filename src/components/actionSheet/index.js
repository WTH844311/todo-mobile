import React, { Component } from 'react'
import { Animated, Dimensions, PanResponder, TouchableOpacity, ScrollView, Text, Modal, View, StyleSheet } from 'react-native'
import util from '../../common/util'

const windowHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    wrapper: {
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        height: windowHeight
    },
    modal: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    overlay: {

    },
    header: {
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderBottomColor: '#f3f3f3',
        borderBottomWidth: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    dragable: {
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    dragableBar: {
        height: 4,
        width: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 2
    },
    main: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        display: 'flex', 
        alignItems: 'center', 
        paddingHorizontal: 80, 
        paddingVertical: 10,
        backgroundColor: 'white'
    },
    titleText: {
        fontWeight: '700',
        fontSize: 16
    },
    subTitle: {
        color: 'grey',
        fontSize: 12
    },
    content: {

    }
})

export default class AndroidActionSheet extends Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            sheetAnim: new Animated.Value(props.translateY || 300),
            top: 0
        }
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                this._top = this.state.top
            },
            onPanResponderMove: (evt, gs) => {
                this.setState({ top: this._top + gs.dy })
                // Animated.timing(this.state.sheetAnim, {
                //     toValue: this._top + gs.dy,
                //     duration: 200
                // }).start();
            },
            onPanResponderRelease: (evt, gs) => {
                if (this.state.top > 0) this.hide()
                this.setState({ top: 0 })
                
            }
        })
    }

    componentWillUnmount() {
        this._panResponder = null
    }

    /** 
    * 标题 
    */
    _renderTitle = () => {
        const { title, titleStyle, subTitle, showBack, showDelete, backAction, deleteAction, submitText, submitAction } = this.props;
        if (!title) return null
        // 确定传入的是不是一个React Element，防止渲染的时候出错 
        if (React.isValidElement(title)) return <View style={styles.title}>{title}</View>
        return (
            <View style={styles.header}>
                <View {...this._panResponder.panHandlers} style={styles.dragable}>
                    <View style={styles.dragableBar}/>
                </View>
                <View style={styles.main}>
                    <TouchableOpacity style={{ paddingRight: 20 }} onPress={backAction || deleteAction}>
                        {showBack && util.getIcon({
                            icon: 'ios-arrow-back',
                            iconFrom: 'Ionicons',
                            color: 'blue'
                        })}
                        {showDelete && <Text style={{ color: 'red', paddingVertical: 10 }}>删除</Text>}
                    </TouchableOpacity>
                    <View {...this._panResponder.panHandlers} style={styles.title}>
                        <Text style={[styles.titleText, titleStyle]}>{title}</Text>
                        {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
                    </View>
                    {submitText && <Text style={{ color: 'blue', paddingVertical: 10 }} onPress={submitAction}>{submitText}</Text>}
                </View>
                
            </View>
        )
    }

    /** 
    * 内容布局 
    */
    _renderContainer = () => {
        const { content } = this.props;
        return <View style={styles.content}>{content}</View>
    }

    // 父组件获取状态
    getVisibleState = () => {
        return this.state.visible
    }

    /** 
     * 控制Modal点击关闭，Android返回键关闭 
     */
    cancel = e => this.hide()

    /** 
     * 显示 
     */
    show = () => {
        this.setState({ visible: true })
        Animated.timing(this.state.sheetAnim, {
            toValue: 0,
            duration: 500
        }).start();
    }

    /** 
     * 隐藏 
     */
    hide = () => {
        setTimeout(() => this.setState({ visible: false }), 300)
        Animated.timing(this.state.sheetAnim, {
            toValue: this.props.translateY || 300,
            duration: 300
        }).start();
    }

    changeVisible = () => {
        if (this.state.visible) return this.hide()
        this.show()
    }

    render() {
        const { visible, sheetAnim } = this.state;
        const { translateY = 300, bgColor } = this.props
        return (
            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={this.cancel}
            >
                <View style={styles.wrapper}>
                    {/* <TouchableOpacity style={styles.overlay}/> */}
                    <Animated.View
                        style={[styles.modal, { backgroundColor: bgColor || '#f9f9f9' }, { height: 1000, top: windowHeight - translateY + this.state.top, transform: [{ translateY: sheetAnim }] }]}
                    >
                        {this._renderTitle()}
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {this._renderContainer()}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}