
import { NextResponse } from 'next/server';
import { createNewUser } from '@/lib/userData';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre.' }, { status: 400 });
    }

    const result = await createNewUser(username, password);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 409 }); // 409 Conflict for existing user
    }
  } catch (error) {
    console.error('API Register Error:', error);
    return NextResponse.json({ success: false, message: 'Kayıt sırasında sunucuda beklenmedik bir hata oluştu.' }, { status: 500 });
  }
}
