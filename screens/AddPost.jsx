import React, { useState } from 'react'
import { Image, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import app from '../firebaseConfig';
import { Controller, useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';

const db = getFirestore(app);

const AddPost = () => {

    const [image, setImage] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState('');

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            postedOn: new Date().toISOString(),
        },
    });

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            uploadFile(result.assets[0].uri);
        }
    };

    const onSubmit = (data) => {
        alert(JSON.stringify(data));
        publishPost(data);
    };

    const generateTimestamp = () => {
        return new Date().toISOString();
    }

    const uploadFile = async (uri) => {
        const storage = getStorage(app);
        const storageRef = ref(storage, `feed-images/${generateTimestamp()}.jpg`);

        try {
            // 1. Fetch image data
            const response = await fetch(uri);
            const blob = await response.blob();

            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Handle progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    // Handle error
                    console.error('Error uploading image:', error);
                    alert('Error uploading image:', error);
                },
                () => {
                    // Handle successful upload
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // 3. Store image URL in Firestore
                        console.log('File available at', downloadURL);
                        setDownloadUrl(downloadURL);
                        // const imagesCollectionRef = collection(db, 'images');
                        // addDoc(imagesCollectionRef, { imageUrl: downloadURL })
                        //   .then((docRef) => {
                        //     console.log('Image URL stored in Firestore:', docRef.id);
                        //   })
                        //   .catch((error) => {
                        //     console.error('Error storing image URL in Firestore:', error);
                        //   });
                    });
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
        }

        // 'file' comes from the Blob or File API
        // uploadBytes(storageRef, image).then((snapshot) => {
        //   console.log('Uploaded a blob or file!');
        //   console.log(snapshot);
        // });
    }

    const publishPost = async (data) => {
        data.image = downloadUrl;
        const docRef = await addDoc(collection(db, 'socialpost'), data);
        console.log(docRef);
    };

    return (
        <View>
            <Text>Add New Post</Text>

            <Button onPress={pickImage} >Pick an Image</Button>
            {image && <Image source={{ uri: image }} resizeMode='contain'
                style={{ width: '100%', height: 300 }}

            />}

            <Controller
                control={control}
                rules={{
                    required: { message: 'Title is required', value: true },
                }}

                render={({ field }) => {
                    return <TextInput
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                        label={"Post Title"}
                        error={errors.title}
                    />
                }}
                name='title'
            />
            <Text>{errors.title?.message}</Text>

            <Controller
                control={control}
                rules={{
                    required: { message: 'Description is required', value: true },
                }}
                render={({ field }) => {
                    return <TextInput
                        multiline
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                        label={"Post Description"}
                        error={errors.description}
                    />
                }}
                name='description'
            />

            <Text>{errors.description?.message}</Text>

            <Button onPress={handleSubmit(onSubmit)} mode='contained'>Publish Post</Button>
        </View>
    )
}

export default AddPost;