import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './services/supabase'; // Certifique-se de que o cliente Supabase está configurado corretamente
import Login from './login';

const Cadastro = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Hook para acessar a navegação

    const [usersData, setUsersData] = useState({
        email: '',
        senha: '',
    });

    // Função de cadastro e navegação
    const handleCadastro = async () => {
        if (username && password) {
            try {
                // Insere o usuário no banco de dados Supabase
                const { data, error } = await supabase
                    .from('users')
                    .insert([{ email: username, senha: password }]);

                if (error) {
                    Alert.alert('Erro', 'Falha ao salvar o cadastro.');
                    console.error('Erro ao salvar:', error);
                } else {
                    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
                    setUsername('');
                    setPassword('');
                    navigation.navigate('login'); // Redireciona para a tela de prontuário
                }
            } catch (ex) {
                console.error('Erro durante o cadastro:', ex);
                Alert.alert('Erro', 'Ocorreu um erro durante o cadastro.');
            }
        } else {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        }
    };

    // Função de atualização dos campos de entrada
    const handleInputChange = (field, value) => {
        setUsersData({ ...usersData, [field]: value });
    };

    return (
        <View style={styles.container}>

            <Image 
                source={require('./img/H-Pulse.jpg')}
                style={{ width: 350, height: 70, marginLeft: 20, marginBottom: 50 }}  
            />


            <Text style={styles.title}>Cadastro</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome de Usuário"
                placeholderTextColor="#888888"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#888888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Cadastre-se" onPress={handleCadastro} />
            <Text style={styles.registerText}>
                Tem uma conta?{' '}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Faça o Login aqui</Text>
                </TouchableOpacity>
            </Text>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        color: 'black',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 15,
        paddingHorizontal: 10,
        color: 'black',
    },
    registerText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'black',
    },
    link: {
        color: '#007bff',
    },
});

export default Cadastro;
