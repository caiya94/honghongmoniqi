import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, schema } from '@/storage/database/pg-client';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const user = await db
      .select({ id: schema.users.id, username: schema.users.username, password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        username: user[0].username,
      },
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
