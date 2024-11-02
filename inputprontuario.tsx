import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform, Modal } from 'react-native';
import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import Geolocation from '@react-native-community/geolocation'; // Importando a geolocalização
import { supabase } from './services/supabase'; // Importando o cliente Supabase
import { WebView } from 'react-native-webview'; // Importando o WebView para exibir o mapa no Modal

const InputProntuario = () => {
    const [prontuarioData, setProntuarioData] = useState({
        name: '',
        gender: '',
        contact: '',
        address: '',
        age: '',
    });

    const [savedLink, setSavedLink] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); // Link padrão
    const [link, setLink] = useState(''); // Estado para armazenar o link lido
    const [prontuarios, setProntuarios] = useState([]);
    const [editingProntuarioId, setEditingProntuarioId] = useState(null);
    const [currentLatitude, setCurrentLatitude] = useState('');
    const [currentLongitude, setCurrentLongitude] = useState('');
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
    const [mapUrl, setMapUrl] = useState(''); // URL para exibir o mapa
    const [nfcWriting, setNfcWriting] = useState(false); // Controla o estado do NFC (escrita)
    const [nfcReading, setNfcReading] = useState(false); // Controla o estado do NFC (leitura)
    const [showPopup, setShowPopup] = useState(false); // Controla a visibilidade do modal
    const [selectedProntuario, setSelectedProntuario] = useState(null); // Prontuário selecionado
    const [currentUser, setCurrentUser] = useState(null);




    useEffect(() => {
        fetchProntuarios(); // Agora chamamos a função fetchProntuarios
        callLocation(); // Função existente para obter localização
        getCurrentUser(); // Nova função para obter o usuário atual

    }, []);

    const getCurrentUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Erro ao obter o usuário:', error);
        } else {
            const email = data?.user?.email; // Obtenha o email do usuário
            setCurrentUser(email); // Armazene o email no estado
        }
    };
    

    const readTag = async () => {
        try {
            setNfcReading(true); // Inicia o estado de leitura
            await NfcManager.requestTechnology(NfcTech.Ndef); // Solicita a tecnologia NFC para NDEF

            const tag = await NfcManager.getTag(); // Obtém os dados da tag
            console.log('Tag lida:', tag);

            // Verifica se há uma mensagem NDEF na tag
            if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                const decodedMessages = tag.ndefMessage.map((record, index) => {
                    let decodedText = '';
                    if (record.tnf === Ndef.TNF_WELL_KNOWN && record.type[0] === 0x55) {
                        // Decodifica URI
                        decodedText = Ndef.uri.decodePayload(record.payload);
                    } else if (record.tnf === Ndef.TNF_WELL_KNOWN && record.type[0] === 0x54) {
                        // Decodifica texto
                        const languageCodeLength = record.payload[0]; // Primeiro byte do payload contém o comprimento do código de idioma
                        const text = record.payload.slice(1 + languageCodeLength).toString('utf8'); // Lê o texto
                        decodedText = text;
                    } else {
                        // Caso não seja URI ou texto conhecido, tenta decodificar como string genérica
                        decodedText = record.payload.toString('utf8');
                    }

                    return `Registro ${index + 1}: ${decodedText}`;
                });

                setLink(decodedMessages.join('\n')); // Atualiza o estado com os dados lidos
                setShowPopup(true); // Exibe o modal
            } else {
                Alert.alert('Erro', 'Nenhuma mensagem NDEF encontrada na tag.');
            }
        } catch (ex) {
            console.warn('Erro ao ler a tag:', ex);
            Alert.alert('Erro', 'Falha ao ler a tag NFC.');
        } finally {
            await NfcManager.cancelTechnologyRequest(); // Cancela a solicitação de tecnologia NFC
            setNfcReading(false); // Finaliza o estado de leitura
        }
    };

    const writeNfc = async () => {
        try {
            if (!selectedProntuario) {
                Alert.alert('Erro', 'Nenhum prontuário selecionado.');
                return;
            }

            setNfcWriting(true);
            await NfcManager.requestTechnology(NfcTech.Ndef);

            // Vamos gravar o ID ou algum campo específico do prontuário no chip NFC
            const prontuarioData = `Prontuário de ${selectedProntuario.name}: Contato ${selectedProntuario.contact}`;
            const bytes = Ndef.encodeMessage([Ndef.textRecord(prontuarioData)]);

            if (bytes) {
                await NfcManager.ndefHandler.writeNdefMessage(bytes);
                Alert.alert('Sucesso', 'O prontuário foi gravado no chip NFC!');
            } else {
                Alert.alert('Erro', 'Falha ao codificar a mensagem NDEF.');
            }
        } catch (ex) {
            console.warn(ex);
            Alert.alert('Erro', 'Falha ao gravar o prontuário no chip NFC.');
        } finally {
            await NfcManager.cancelTechnologyRequest();
            setNfcWriting(false);
        }
    };

    const deleteNfc = async () => {
        try {
            setNfcWriting(true);
            await NfcManager.requestTechnology(NfcTech.Ndef);

            const emptyTextRecord = Ndef.textRecord(''); // Registro de texto vazio
            const bytes = Ndef.encodeMessage([emptyTextRecord]);
            if (bytes) {
                await NfcManager.ndefHandler.writeNdefMessage(bytes);
                Alert.alert('Sucesso', 'Os dados foram apagados do chip NFC!');
            } else {
                Alert.alert('Erro', 'Falha ao apagar a mensagem.');
            }
        } catch (ex) {
            console.warn(ex);
            Alert.alert('Erro', 'Falha ao apagar os dados no chip NFC.');
        } finally {
            await NfcManager.cancelTechnologyRequest();
            setNfcWriting(false);
        }
    };



    const callLocation = () => {
        if (Platform.OS === 'ios') {
            getLocation();
        } else {
            const requestLocationPermission = async () => {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Permissão de Acesso à Localização",
                        message: "Este aplicativo precisa acessar sua localização",
                        buttonNeutral: "Pergunte-me depois",
                        buttonNegative: "Cancelar",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getLocation();
                } else {
                    Alert.alert('Permissão de Acesso negada');
                }
            };
            requestLocationPermission();
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const currentLatitude = JSON.stringify(position.coords.latitude);
                const currentLongitude = JSON.stringify(position.coords.longitude);
                setCurrentLatitude(currentLatitude);
                setCurrentLongitude(currentLongitude);
            },
            (error) => {
                console.log(error);
                Alert.alert('Erro', 'Não foi possível obter a localização.');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    const handleInputChange = (field, value) => {
        setProntuarioData({ ...prontuarioData, [field]: value });
    };

    const fetchProntuarios = async () => {
        const { data, error } = await supabase
            .from('pacient')
            .select('*');

        if (error) {
            Alert.alert('Erro', 'Não foi possível buscar os prontuários.');
            console.error('Erro ao buscar prontuários:', error);
        } else {
            setProntuarios(data); // Atualiza o estado com os prontuários recebidos
        }
    };

    const saveProntuario = async () => {
        const { data, error } = await supabase
            .from('pacient')
            .insert([{
                name: prontuarioData.name,
                gender: prontuarioData.gender,
                contact: prontuarioData.contact,
                address: prontuarioData.address,
                age: prontuarioData.age,
                latitude: currentLatitude,  // Valor validado ou null
                longitude: currentLongitude, // Valor validado ou null
            }]);

        if (error) {
            Alert.alert('Erro', 'Não foi possível salvar o prontuário');
            console.error('Erro ao salvar:', error);
        } else {
            Alert.alert('Sucesso', 'Prontuário salvo com sucesso!');
            fetchProntuarios(); // Atualiza a lista de prontuários após salvar
            setProntuarioData({ name: '', gender: '', contact: '', address: '', age: ''}); // Limpar campos
            // Após salvar com sucesso, deseleciona o prontuário
            setSelectedProntuario(null);
        }
    };

    const openMapModal = (latitude, longitude) => {
        setMapUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setModalVisible(true);
    };

    return (
        <ScrollView style={styles.container}>


            {/* Cabeçalho com o nome do usuário */}
            <Text style={styles.headerText}>Bem-vindo, {currentUser || 'Usuário'}</Text>

            
            {/* O restante do seu componente */}

            <Text style={styles.title}>Adicionar/Editar Prontuário</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#888888"
                value={prontuarioData.name}
                onChangeText={(value) => handleInputChange('name', value)}
            />

            <TextInput
                style={styles.input}
                placeholder="Gênero"
                placeholderTextColor="#888888"
                value={prontuarioData.gender}
                onChangeText={(value) => handleInputChange('gender', value)}
            />

            <TextInput
                style={styles.input}
                placeholder="Contato"
                placeholderTextColor="#888888"
                value={prontuarioData.contact}
                onChangeText={(value) => handleInputChange('contact', value)}
            />

            <TextInput
                style={styles.input}
                placeholder="Endereço"
                placeholderTextColor="#888888"
                value={prontuarioData.address}
                onChangeText={(value) => handleInputChange('address', value)}
            />

            <TextInput
                style={styles.input}
                placeholder="Idade"
                placeholderTextColor="#888888"
                value={prontuarioData.age}
                onChangeText={(value) => handleInputChange('age', value)}
            />

            <Button title="Salvar Prontuário" onPress={saveProntuario} />

            <Text style={styles.subtitle}>Prontuários Cadastrados</Text>
            {prontuarios.length > 0 ? (
                prontuarios.map((prontuario) => (
                    <View key={prontuario.id} style={styles.prontuarioItem}>
                        <Text style={styles.blackText}>Nome: {prontuario.name}</Text>
                        <Text style={styles.blackText}>Contato: {prontuario.contact}</Text>
                        <Text style={styles.blackText}>Endereço: {prontuario.address}</Text>
                        <Text style={styles.blackText}>Idade: {prontuario.age}</Text>
                        <TouchableOpacity onPress={() => openMapModal(prontuario.latitude, prontuario.longitude)}>
                            <Text style={styles.mapButton}>Abrir no Google Maps</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedProntuario(prontuario)}>
                            <Text style={selectedProntuario?.id === prontuario.id ? styles.selectedButton : styles.mapButton}>
                                {selectedProntuario?.id === prontuario.id ? 'Selecionado' : 'Selecionar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <Text style={styles.blackText}>Nenhum prontuário cadastrado.</Text>
            )}

            {/* Modal para exibir o mapa */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
                    <Button title="Fechar" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            <View style={styles.section}>
                <Button title="Escrever prontuário no chip NFC" onPress={writeNfc} />
            </View>

            <View style={styles.section}>
                <Button title="Ler NFC" onPress={readTag} />
                
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showPopup}
                    onRequestClose={() => setShowPopup(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Link lido:</Text>
                        <Text style={styles.linkText}>{link}</Text>
                        <Button title="Fechar" onPress={() => setShowPopup(false)} />
                    </View>
                </Modal>

            </View>

            {/*<View style={styles.section}>
                <Button title="Escrever link no chip NFC" onPress={writeNfc} />
            </View>*/}

            <View style={styles.section}>
                <Button title="Apagar no chip NFC" onPress={deleteNfc} />
            </View>

            {/*savedLink ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Link do YouTube Salvo:</Text>
                    <Text style={styles.sectionTitle}>{savedLink}</Text>
                </View>
            ) : null*/}

            {/* Modal de espera para leitura NFC */}
            <Modal visible={nfcReading} transparent={true}>
                <View style={styles.popupContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popupText}>
                            Aproxime o Chip NFC para realizar a leitura...
                        </Text>
                        {nfcReading && <ActivityIndicator size="large" color="#0000ff" />}
                    </View>
                </View>
            </Modal>


            <Modal visible={nfcWriting} transparent={true}>
                <View style={styles.popupContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popupText}>
                            Aproxime o Chip NFC para realizar a escrita ou apagar...
                        </Text>
                        {nfcWriting && <ActivityIndicator size="large" color="#0000ff" />}
                    </View>
                </View>
            </Modal>


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: "black",    
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: 'black',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: 'black',
    },
    prontuarioItem: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        color: 'black',
    },
    prontuarioText: {
        fontSize: 16,
    },
    mapButton: {
        color: 'green',
        marginTop: 5,
    },
    modalView: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    blackText: {
        color: 'black',
    },
    section: {
        backgroundColor: '#fff',
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
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        color: '#000000',
    },
    linkText: {
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000000',
    },
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    popup: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    popupText: {
        fontSize: 16,
        marginBottom: 20,
        color: '#000000',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
        color: 'black',
    },
    
});

export default InputProntuario;
