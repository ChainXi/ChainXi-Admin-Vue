import { JSEncrypt } from 'jsencrypt'

// 加密
export const rsaEncrypt = (publicKey: string, val: string): string => {
  if (val === '') {
    return ''
  }
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(val) || '' // 对数据进行加密
}
export const base64ToByteArray = (base64: string): Uint8Array => {
  var binary_string = window.atob(base64) //解码使用base64编码的字符串
  var len = binary_string.length //获取长度
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}


export const base64ToBlob = function (base64: string, contentType = '', sliceSize = 512) {
  // const cleanedBase64 = base64
  // const fixedBase64 = cleanedBase64
  // const padding = '='.repeat((4 - (fixedBase64.length % 4)) % 4)
  // const validBase64 = fixedBase64 + padding

  try {
    const byteCharacters = atob(base64)
    const byteArrays = []

    // 将二进制数据分片处理，每片长度为sliceSize，创建Uint8Array数组。
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      // 创建Uint8Array数组，用于表示二进制数据的一个片段。
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    // 创建Blob对象，包含所有的二进制数据片段，并指定MIME类型。
    return new Blob(byteArrays, { type: contentType })
  } catch (e) {
    console.error('Failed to convert base64 to blob:', e)
    return null
  }
}
