Page({
  ws: null,
  onLoad: function () {
    // 连接 WebSocket 到 Flask 服务
    const ws = wx.connectSocket({
      url: 'ws://127.0.0.1:3000/chat',  // 确保 URL 正确指向 Flask 服务器上的 WebSocket 路由
      success: resConnect => {
        console.log('WebSocket连接成功', resConnect)
      },
      fail: resConnectError => {
        console.log('WebSocket连接失败', resConnectError)
      }
    })

    // 监听接收到的消息       
    ws.onMessage(msg => {
      try {
        const data = JSON.parse(msg.data); // 确保数据是 JSON 格式
        console.log('收到服务器响应:', data.content);
    
        const list = this.data.list;
        const lastId = list.length;
    
        // 添加接收到的内容到消息列表
        list.push({
          id: lastId,
          content: data.content || "模型无内容返回",
          role: 'server'
        });
    
        this.setData({ list, lastId });
      } catch (e) {
        console.error("数据解析错误:", e);
        wx.showToast({
          title: "接收数据错误",
          icon: "none",
          duration: 2000
        });
      }
    });

    ws.onClose(res => {
      console.log('WebSocket连接关闭', res);
    });

    this.ws = ws;
  },

  onUnload: function () {
    // 页面卸载时关闭 WebSocket 连接
    this.ws.close();
  },

  data: {
    content: '',
    list: [],
    lastId: ''
  },

  // input 实现将输入框输入的文本保存到 message 中
  input: function (e) {
    this.message = e.detail.value;
  },

  // 点击发送按钮将输入框的消息发送到后端
  send: function () {
    if (!this.message) {
      wx.showToast({
        title: '消息不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    // 发送消息到后端
    this.ws.send({
      data: this.message
    });

    // 将当前消息添加到聊天列表
    const list = this.data.list;
    const lastId = list.length;
    list.push({
      id: lastId,
      content: this.message,
      role: 'me'
    });

    // 更新聊天列表并清空输入框
    this.setData({ list, lastId, content: '' });
    this.message = '';  // 清空输入框
  }
})
