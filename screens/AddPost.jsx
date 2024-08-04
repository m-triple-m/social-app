import React, { useState } from 'react'
import { Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app);

const AddPost = () => {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const publishPost = async () => {
        const docRef = await addDoc(collection(db, 'socialpost'), { title, description });
        console.log(docRef);

    };

    return (
        <View>
            <Text>Add New Post</Text>
            <TextInput onChangeText={setTitle} label={"Post Title"} />
            <TextInput onChangeText={setDescription} label={"Post Description"} />
            <Button onPress={publishPost} mode='contained'>Publish Post</Button>
        </View>
    )
}

export default AddPost;