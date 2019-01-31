import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';

const buttonWithBackground = props => {
    const content = (
        <View style={[styles.button, {backgroundColor: props.color}]}>
            <Text>{props.children}</Text>
        </View>
    );
    if(Platform.OS === 'android'){
        return (
            <TouchableNativeFeedback onPress={props.onPress}>
                {content}
            </TouchableNativeFeedback>
        );
    }
    // If not android
    return (
        <TouchableOpacity onPress={props.onPress}>
            {content}
        </TouchableOpacity>
    );

};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "black"
    }
});

export default buttonWithBackground;