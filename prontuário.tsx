import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Button, Alert } from 'react-native';
import { supabase } from './services/supabase'; // Importando o cliente Supabase
import InputProntuario from './inputprontuario';


const Prontuario = () => {

/*
    const saveProntuario = async () => {
        const { data, error } = await supabase
            .from('pacient') // Nome da tabela no Supabase
            .insert([
                {
                    name: prontuarioData.name,
                    age: prontuarioData.age,
                    gender: prontuarioData.gender,
                    contact: prontuarioData.contact,
                    address: prontuarioData.address,
                },
            ]);

        if (error) {
            Alert.alert('Erro', 'Não foi possível salvar o prontuário');
            console.error('Erro ao salvar:', error);
        } else {
            Alert.alert('Sucesso', 'Prontuário salvo com sucesso!');
        }
    }  
    
*/

    /*
    const handleEdit = (item) => {
        // Lógica para editar item
        console.log('Editando item:', item);
    };
    */

    /*const handleDelete = (item) => {
        // Lógica para deletar item
        console.log('Deletando item:', item);
    };
    */
    return (
        <ScrollView style={styles.container}>
            <InputProntuario />
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 20,
        backgroundColor: '#ffffff', // Fundo branco para o cabeçalho
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // Sombra para Android
    },
    infoText: {
        color: '#000000', // Texto em preto
        marginBottom: 5, // Margem entre os textos
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    section: {
        backgroundColor: '#ffffff', // Fundo branco para as seções
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    listItem: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#000000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 150, // Largura para os dois botões
    },
    saveButtonContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
});

export default Prontuario;
