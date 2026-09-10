// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import {getSystemStatus} from "../../../libs/domain/src";
// // import {getSystemStatus} from "@rem-web/domain";
// // import {getSystemStatus} from "@rem-web/domain";
// // import { getSystemStatus } from '@my-system/domain';
// // --jsx
// export default function App() {
//     const { status, user } = getSystemStatus();
//
//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Mobile Host (Expo / React Native)</Text>
//             <View style={styles.card}>
//                 <Text style={styles.status}>{status}</Text>
//                 <Text style={styles.user}>Пользователь: {user.name}</Text>
//             </View>
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0f172a',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 20,
//     },
//     title: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#38bdf8',
//         marginBottom: 20,
//     },
//     card: {
//         backgroundColor: '#1e293b',
//         padding: 20,
//         borderRadius: 12,
//         width: '100%',
//     },
//     status: {
//         color: '#4ade80',
//         marginBottom: 8,
//     },
//     user: {
//         color: '#f8fafc',
//     },
// });