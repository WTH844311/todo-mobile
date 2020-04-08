import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { inject, observer } from 'mobx-react'
import TaskItem from '../../components/taskItem/index'
import util from '../../common/util'

let searchInputRef = null

class Search extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchValue: '',
            searchResult: [],
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { tasks } = this.props.store
        const searchValue = this.state.searchValue
        if (prevState.searchValue !== searchValue) {
            if (!searchValue) {
                this.setState({ searchResult: [] })
            } else {
                const result = tasks.filter(t => t.title.includes(searchValue) || (t.note && t.note.includes(searchValue)) || (t.steps && t.steps.length > 0 && t.steps.find(s => s.title.includes(searchValue))))
                this.setState({ searchResult: JSON.parse(JSON.stringify(result)) })
            }
        }
    }

    render() {
        const { searchValue, searchResult } = this.state        
        const { navigation, state } = this.props
        return (
            <View style={styles.background}>
                <View style={styles.header}>
                    <View style={styles.search}>
                        <View style={styles.search_prefix}>
                            {util.getIcon({
                                icon: 'search1',
                                iconFrom: 'AntDesign',
                                color: 'white'
                            })}
                        </View>
                        <TextInput
                            ref={input => { searchInputRef = input }}
                            style={styles.search_input}
                            placeholder="搜索"
                            placeholderTextColor='#C8D2D3'
                            onChangeText={text => this.setState({ searchValue: text })}
                        />
                        {searchValue !== '' && (
                            <TouchableOpacity style={styles.search_clear} onPress={() => {
                                searchInputRef.clear()
                                this.setState({ searchValue: '' })
                            }}>
                                {util.getIcon({
                                    icon: 'closecircle',
                                    iconFrom: 'AntDesign',
                                    size: 15,
                                    color: '#7D7D7D'
                                })}
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.cancel} onPress={state.changeShowSearch}>
                        <Text style={styles.cancel_text}>取消</Text>
                    </TouchableOpacity>
                </View>
                {searchResult.length > 0 ? (
                    <ScrollView style={styles.scrollView}>
                        {searchResult.map(task => <TaskItem key={task._id} task={task} currentList={{}} navigation={navigation}/>)}
                    </ScrollView>
                ) : (
                    <View style={styles.default}>
                        {util.getIcon({
                            icon: 'search1',
                            iconFrom: 'AntDesign',
                            size: 80,
                            color: '#6E7BE6',
                            style: {
                                padding: 15
                            }
                        })}
                        <Text style={styles.default_text}>你想查找什么内容？可在任务、步骤和备注内搜索</Text>
                    </View>
                )}
                
            </View>
        );
    }
}

const windowHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    background: {
        backgroundColor: '#809697',
        height: windowHeight,
        // paddingHorizontal: 9
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 3,
        paddingTop: 20,
        paddingBottom: 10,
    },
    search: {
        flex: 1,
        marginHorizontal: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        
    },
    search_input: {
        flex: 1,
        padding: 10,
        fontSize: 15,
        color: 'white'
    },
    cancel: {
        width: 50
    },
    cancel_text: {
        color: 'white',
        fontSize: 18
    },
    scrollView: {
        paddingHorizontal: 10
    },
    default: {
        flex: 1,
        paddingHorizontal: 30,
        paddingVertical: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    default_text: {
        color: 'white',
        fontSize: 15,
        textAlign: 'center'
    }
})

export default inject('store', 'state')(observer(Search))