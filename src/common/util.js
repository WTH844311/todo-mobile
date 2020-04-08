import React from 'react'
import IconAntDesign from 'react-native-vector-icons/AntDesign'
import IconFeather from 'react-native-vector-icons/Feather'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome'
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons'
import IconIonicons from 'react-native-vector-icons/Ionicons'
import IconEvilIcons from 'react-native-vector-icons/EvilIcons'
import IconEntypo from 'react-native-vector-icons/Entypo'
import IconFontisto from 'react-native-vector-icons/Fontisto'
import IconMaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

const getIcon = ({ style, icon, iconFrom, size=20, color='grey' }) => {
    switch(iconFrom) {
        case 'AntDesign':
            return <IconAntDesign style={style} name={icon} size={size} color={color}/> 
        case 'Feather':
            return <IconFeather style={style} name={icon} size={size} color={color}/> 
        case 'FontAwesome':
            return <IconFontAwesome style={style} name={icon} size={size} color={color}/> 
        case 'FontAwesome5':
            return <IconFontAwesome5 style={style} name={icon} size={size} color={color}/> 
        case 'MaterialIcons':
            return <IconMaterialIcons style={style} name={icon} size={size} color={color}/> 
        case 'Ionicons':
            return <IconIonicons style={style} name={icon} size={size} color={color}/> 
        case 'EvilIcons':
            return <IconEvilIcons style={style} name={icon} size={size} color={color}/> 
        case 'Entypo':
            return <IconEntypo style={style} name={icon} size={size} color={color}/> 
        case 'Fontisto':
            return <IconFontisto style={style} name={icon} size={size} color={color}/> 
        case 'MaterialCommunityIcons':
            return <IconMaterialCommunityIcon style={style} name={icon} size={size} color={color}/> 
    }
}

const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const formatDate = (date, ...ignore) => {
    let newDate = new Date(date)
    if (newDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)) return '今天'
    if (newDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000) return '明天'
    if (newDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000) return '昨天'
    let dateStr = ''
    if (ignore.indexOf('Year') === -1) {
        dateStr = `${newDate.getFullYear()}年`
    }
    dateStr += `${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][newDate.getMonth()]}月`
    dateStr += `${newDate.getDate()}日`
    if (ignore.indexOf('Week') === -1) {
        dateStr += `${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][newDate.getDay()]}`
    }
    return dateStr
}

const LightenDarkenColor = (col, amt) => {
    let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

export default {
    getIcon,
    formatDate,
    arraysEqual,
    LightenDarkenColor
}