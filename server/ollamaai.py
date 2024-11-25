from flask import Flask
from flask_sock import Sock
from ollama import Client
import json

app = Flask(__name__)
sock = Sock(app)

# Ollama Client 初始化，替换 localhost:11434 为 Ollama 实际地址
ollama_client = Client(host='http://localhost:11434')

@sock.route('/chat')
def chat(ws):
    while True:
        try:
            # 接收用户消息
            user_message = ws.receive()
            print(f"接收到用户消息: {user_message}")
            
            if user_message:
                # 调用模型获取响应
                response = ollama_client.chat(
                    model='ano',
                    messages=[{'role': 'user', 'content': user_message}]
                )
                print(f"模型返回: {response}")

                # 提取模型的回复内容
                reply = response.message.content if response.message and response.message.content else "模型无内容返回"
            else:
                reply = "接收到的消息为空"
        except Exception as e:
            print(f"模型调用失败: {e}")
            reply = f"模型调用失败: {e}"

        # 确保发送的是 JSON 格式
        ws.send(json.dumps({'content': reply}))


# 启动flask web应用
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
