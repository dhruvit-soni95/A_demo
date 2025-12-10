import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Phone, Mail } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const { patron } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello ' + (patron?.first_name || 'there') + '! Welcome to Calgary Opera support. How can we help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const text = inputText.toLowerCase();
      let reply = 'Thanks for your message! Call us at 403-262-7286 or email info@calgaryopera.com';

      if (text.includes('ticket')) {
        reply = 'You can purchase tickets in the Events tab! Tap Buy Tickets on the home screen.';
      } else if (text.includes('donation')) {
        reply = 'Thank you for your interest! Tap the Donate button on the home screen to make a donation.';
      } else if (text.includes('seat')) {
        reply = 'Your seat information is on your ticket. View tickets in the Tickets tab.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>We're here to help</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.isUser ? styles.userMessage : styles.botMessage]}
            >
              <Text style={[styles.messageText, message.isUser && styles.userMessageText]}>
                {message.text}
              </Text>
              <Text style={[styles.messageTime, message.isUser && styles.userMessageTime]}>
                {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
          ))}

          {messages.length === 1 && (
            <View style={styles.quickReplies}>
              <Text style={styles.quickRepliesTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.quickReply} onPress={() => { setInputText('How do I buy tickets?'); setTimeout(sendMessage, 100); }}>
                <Text style={styles.quickReplyText}>How do I buy tickets?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickReply} onPress={() => { setInputText('I want to make a donation'); setTimeout(sendMessage, 100); }}>
                <Text style={styles.quickReplyText}>I want to make a donation</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.contactBar}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={20} color="#000000" />
            <Text style={styles.contactButtonText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <Mail size={20} color="#000000" />
            <Text style={styles.contactButtonText}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#CCCCCC'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  flex: { flex: 1 },
  header: { backgroundColor: '#FFFFFF', padding: 24, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  title: { fontSize: 28, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 14, color: '#666666', marginTop: 4 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userMessage: { backgroundColor: '#000000', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botMessage: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E5E5' },
  messageText: { fontSize: 15, color: '#000000', lineHeight: 20, marginBottom: 4 },
  userMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 11, color: '#999999' },
  userMessageTime: { color: '#CCCCCC' },
  quickReplies: { marginTop: 16 },
  quickRepliesTitle: { fontSize: 14, fontWeight: '600', color: '#666666', marginBottom: 12 },
  quickReply: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E5E5' },
  quickReplyText: { fontSize: 14, color: '#000000', textAlign: 'center' },
  contactBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5E5', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingVertical: 10, gap: 8 },
  contactButtonText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5E5', gap: 12 },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#000000', maxHeight: 100 },
  sendButton: { width: 44, height: 44, backgroundColor: '#000000', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#F5F5F5' },
});
