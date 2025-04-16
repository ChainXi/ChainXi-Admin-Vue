import http from '@/utils/request'

export interface OssUploadCredentialsRespVo {
  objectName: string
  url: string
}

const getOSSSignUploadUrl = async (): Promise<ResponseResult<OssUploadCredentialsRespVo>> => {
  return await http.get('/file/get-oss-upload-sign-url')
}

export const uploadFile = async (data: Blob): Promise<string> => {
  const uploadCredentialsRespVo = (await getOSSSignUploadUrl()).data
  await http.upload(uploadCredentialsRespVo.url, { file: data }, { method: 'PUT' })
  return uploadCredentialsRespVo.objectName
}
