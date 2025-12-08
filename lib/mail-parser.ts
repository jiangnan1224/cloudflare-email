import { parse_message } from 'mail-parser-wasm'

export async function parseMessage(rawMessage: string) {
  try {
    const result = parse_message(rawMessage)
    return result
  } catch (error) {
    console.error('mail-parser: Error parsing message:', error)
    return null
  }
} 