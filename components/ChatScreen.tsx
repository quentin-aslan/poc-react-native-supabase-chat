import {Alert, FlatList, SafeAreaView} from "react-native";
import React, {useEffect, useState} from "react";
import Message from "./Message";
import { Message as MessageType} from "../types/Message";
import ChatInput from "./ChatInput";
import supabase from "../lib/initSupabase";
import { Session } from '@supabase/supabase-js'

const ChatScreen = ({session}: {session: Session}) => {
    const [messages, setMessages] = useState<MessageType[]>([]);

    // This function is called once the component is mounted
    useEffect(() => {
        fetchMessages().then();
        listenForMessages().then();
    }, [])

    const fetchMessages = async () => {
        const { data, error } = await supabase.from('messages').select(`content, email`);
        if(error) return Alert.alert("Error", "Something went wrong");
        setMessages(data);
    }

    const listenForMessages = async () => {
        supabase.channel('table-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    if(payload.new) setMessages((messages) => [...messages, payload.new] as MessageType[]);
                }
            )
            .subscribe()
    }

    return (
        <SafeAreaView>
            <ChatInput session={session} />
            <FlatList
                inverted={true}
                data={messages}
                renderItem={({item}) => Message(item)}
            />
        </SafeAreaView>
    );
}
export default ChatScreen;