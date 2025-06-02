import { NextResponse } from 'next/server';

// GET 请求处理函数
export async function GET() {
  try {
    return NextResponse.json(
      {
        message: "hello world",
        timestamp: new Date().toISOString(),
        status: "success"
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        message: "获取数据失败" 
      },
      { status: 500 }
    );
  }
}

// POST 请求处理函数（可选）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || "world";
    
    return NextResponse.json(
      {
        message: `hello ${name}`,
        timestamp: new Date().toISOString(),
        status: "success"
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Bad Request",
        message: "请求数据格式错误" 
      },
      { status: 400 }
    );
  }
} 