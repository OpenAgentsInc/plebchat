import { useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import {
  generatePrivateKey,
  validateEvent,
  verifySignature,
  signEvent,
  getEventHash,
  getPublicKey,
  relayInit
} from 'nostr-tools'



export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const connectToRelay = async () => {

    const relay = relayInit('wss://nostr.semisol.dev')
    await relay.connect()

    relay.on('connect', () => {
      Alert.alert(`connected to ${relay.url}`)
    })
    relay.on('error', () => {
      console.log(`failed to connect to ${relay.url}`)
    })

  // let's query for an event that exists
  let sub = relay.sub([
    {
      kinds: [1],
      limit: 3,
    }
  ])

  sub.on('event', event => {
    Alert.alert('Event:', JSON.stringify(event))
  })
  sub.on('eose', () => {
    Alert.alert('eose')
    sub.unsub()
  })

  }
  useEffect(() => {
    let privateKey = generatePrivateKey() // `sk` is a hex string
    let pubkey = getPublicKey(privateKey) // `pk` is a hex string

    let event: any = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: 'hello',
      pubkey
    }

    event.id = getEventHash(event)
    event.sig = signEvent(event, privateKey)

    let ok = validateEvent(event)
    let veryOk = verifySignature(event)

    // Alert.alert(`Event is valid: ${ok} and signature is valid: ${veryOk}`)
    connectToRelay()

  }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlebChat</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
