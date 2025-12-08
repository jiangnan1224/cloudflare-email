import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    // 从环境变量或请求头中获取 API key
    const resendApiKey = request.headers.get('x-resend-api-key')
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Resend API Key is required' },
        { status: 400 }
      )
    }

    const resend = new Resend(resendApiKey)
    const body = await request.json()

    try {
      const data = await resend.emails.send({
        from: body.from,  // 使用传入的发件人地址
        to: body.to,
        subject: body.subject,
        html: body.html,
        attachments: body.attachments
      })

      console.log('Resend API response:', data)
      return NextResponse.json(data)
    } catch (sendError: any) {
      // 记录详细的发送错误
      console.error('Resend API error:', {
        message: sendError.message,
        response: sendError.response,
        statusCode: sendError.statusCode,
        data: sendError.data
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: sendError.message,
          statusCode: sendError.statusCode,
          data: sendError.data
        },
        { status: sendError.statusCode || 500 }
      )
    }
  } catch (error: any) {
    console.error('General error:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: error.message 
      },
      { status: 500 }
    )
  }
} 