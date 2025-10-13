// 验证工具函数 - 与后端验证规则保持一致

/**
 * 验证用户名
 * 后端要求：最大20个字符，只能包含字母、数字、_、@、+、.、-，必须包含至少一个字母
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20个字符' }
  }
  
  if (!/^[a-zA-Z0-9_@+.-]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、_、@、+、.、-这些字符' }
  }
  
  if (!/[a-zA-Z]/.test(username)) {
    return { valid: false, message: '用户名必须包含至少一个字母' }
  }
  
  return { valid: true }
}

/**
 * 验证密码
 * 后端要求：最少8位，必须包含大写字母、小写字母、数字、特殊字符
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }
  
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个大写字母' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个小写字母' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' }
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个特殊字符 (!@#$%^&*(),.?":{}|<>)' }
  }
  
  return { valid: true }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: true } // 邮箱是可选的
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }
  
  return { valid: true }
}

/**
 * 验证用户类型
 */
export function validateCharacter(character: number): { valid: boolean; message?: string } {
  if (character !== 0 && character !== 1 && character !== 2) {
    return { valid: false, message: '用户类型必须是0(管理员)、1(志愿者)或2(NPO)' }
  }
  
  return { valid: true }
}
