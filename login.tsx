import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './services/supabase'; // Importando o cliente Supabase

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Hook para acessar a navegação

    const handleLogin = async () => {
        if (username && password) {
            // Verifica as credenciais no Supabase
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', username)
                .eq('senha', password);

            if (error || data.length === 0) {
                Alert.alert('Erro', 'Usuário ou senha incorretos');
            } else {
                Alert.alert('Sucesso', 'Login realizado com sucesso!');
                navigation.navigate('Prontuario'); // Redireciona para a tela de prontuário
            }
        } else {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        }
    };

    return (
        <View style={styles.container}>

            <Image 
                source={require('./img/H-Pulse.jpg')}
                style={{ width: 350, height: 70, marginLeft: 20, marginBottom: 50 }}  
            />
    
            <Text style={styles.title}>Login</Text>
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
            <Button title="Entrar" onPress={handleLogin} />
            <Text style={styles.registerText}>
                Não tem uma conta?{' '}
                <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                    <Text style={styles.link}>Registre-se aqui</Text>
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

export default Login;
