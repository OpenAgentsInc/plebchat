import { useState, useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text } from 'react-native';

import {
  generatePrivateKey,
  getEventHash,
  getPublicKey,
  relayInit,
  signEvent
} from 'nostr-tools'

export default function TabOneScreen() {
  const [messages, setMessages] = useState<any>([]);

  const connectToRelay = async () => {
    const relay = relayInit('wss://nostr.oxtr.dev')
    // const relay = relayInit('wss://nostr.semisol.dev')
    await relay.connect()

    // let's query for events of kind 1 and fetch the last 25 events
    let sub = relay.sub([
      {
        kinds: [1],
        limit: 25,
      }
    ])

    sub.on('event', (event: any) => {
      setMessages((prevMessages:any) => [...prevMessages, event]);
    })


    let sk = generatePrivateKey() // `sk` is a hex string
    let pk = getPublicKey(sk) // `pk` is a hex string


    let event: any = {
      kind: 1,
      pubkey: pk,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: 'hello world'
    }
    event.id = getEventHash(event)
    event.sig = signEvent(event, sk)

    Alert.alert('Event', JSON.stringify(event));

    let pub = relay.publish(event)
    pub.on('ok', () => {
      console.log(`${relay.url} has accepted our event`)
    })
    pub.on('seen', () => {
      console.log(`we saw the event on ${relay.url}`)
    })
    pub.on('failed', reason => {
      console.log(`failed to publish to ${relay.url}: ${reason}`)
    })
  }

  useEffect(() => {
    connectToRelay();
  }, [])

  return (
    <FlatList
      data={messages}
      renderItem={({item}) => <Text style={{ color: 'blue'}}>{item.content}</Text>}
      keyExtractor={item => item.id}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
