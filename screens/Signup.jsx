import { View, Text, Modal } from 'react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import { Button, TextInput } from 'react-native-paper';
import app from '../firebaseConfig';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

const auth = getAuth(app);

const Signup = ({ visible, setVisible, openLogin }) => {

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const onSubmit = (data) => {
        // alert(JSON.stringify(data)); 

        createUserWithEmailAndPassword(auth, data.email, data.password)
            .then((result) => {
                const { user } = result;
                console.log(user);
                alert('User created successfully');
            }).catch((err) => {
                console.log(err);
                alert(err.message);
            });
    };

    return (
        <Modal visible={visible} onRequestClose={() => { setVisible(false) }}>
            <View>
                <Text>Signup</Text>

                <Controller
                    control={control}
                    rules={{
                        required: { message: 'Email is required', value: true }
                    }}

                    render={({ field }) => {
                        return <TextInput
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            value={field.value}
                            label={"Email Address"}
                            error={errors.email}
                        />
                    }}
                    name='email'
                />
                <Text>{errors.email?.message}</Text>


                <Controller
                    control={control}
                    rules={{
                        required: { message: 'Password is required', value: true },
                    }}

                    render={({ field }) => {
                        return <TextInput
                            secureTextEntry
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            value={field.value}
                            label={"Password"}
                            error={errors.password}
                        />
                    }}
                    name='password'
                />
                <Text>{errors.password?.message}</Text>

                <Button onPress={handleSubmit(onSubmit)} mode='contained'>Signup</Button>
                <Button onPress={openLogin} style={{ marginTop: 20 }} mode='outlined'>Already Registered</Button>

            </View>
        </Modal>
    )
}

export default Signup;