// 测试文章保存功能
// 在浏览器控制台运行此脚本

// 1. 检查 token
const token = localStorage.getItem('accessToken')
console.log('Token exists:', !!token)
console.log('Token preview:', token?.substring(0, 50))

// 2. 检查 API 基础 URL
const apiUrl = `${window.location.protocol}//${window.location.hostname}:3003/api/v1`
console.log('API URL:', apiUrl)

// 3. 测试创建文章
async function testCreateArticle() {
  try {
    const response = await fetch(apiUrl + '/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '浏览器测试文章 ' + Date.now(),
        slug: 'browser-test-' + Date.now(),
        content: '<p>测试内容</p>',
        excerpt: '测试摘要',
        status: 'DRAFT'
      })
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (data.success) {
      console.log('✅ 文章创建成功!')
      console.log('文章 ID:', data.data.id)
      console.log('文章标题:', data.data.title)
    } else {
      console.error('❌ 文章创建失败')
      console.error('Error:', data)
    }
  } catch (error) {
    console.error('❌ 请求失败:', error)
  }
}

// 运行测试
testCreateArticle()
