import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, schema } from '@/storage/database/pg-client';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度必须在3-20个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6个字符' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db
      .insert(schema.users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning({ id: schema.users.id, username: schema.users.username });

    return NextResponse.json({
      success: true,
      user: {
        id: result[0].id,
        username: result[0].username,
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
