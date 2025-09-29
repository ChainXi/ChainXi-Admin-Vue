<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('cacheManager.cacheName')" prop="name">
        <el-input v-model="modelValue.name" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('cacheManager.expireTimes')" prop="expireTimes">
        <div class="w-full">
          <el-table :data="modelValue.expireTimes" size="small" border>
            <el-table-column :label="$t('cacheManager.storageCache')" width="140">
              <template #default="scope">
                <el-select v-model="scope.row.storageCache" style="width:140px">
                  <el-option :value="StorageCacheEnum.CAFFEINE" :label="$t('cacheManager.storageCacheLocal')" />
                  <el-option :value="StorageCacheEnum.REDIS" :label="$t('cacheManager.storageCacheRemote')" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('cacheManager.expireTime')" width="160">
              <template #default="scope">
                <el-input-number v-model="scope.row.expireTime" :min="0" :step="60" />
              </template>
            </el-table-column>
            <el-table-column width="80" align="center" :label="$t('common.action')">
              <template #default="scope">
                <el-button link type="danger" @click="removeExpire(scope.$index)">X</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button class="mt-10px" type="primary" link @click="addExpire">{{ $t('cacheManager.addExpireTime') }}</el-button>
        </div>
      </el-form-item>
      <el-form-item :label="$t('common.remark')" prop="remark">
        <el-input v-model="modelValue.remark" :placeholder="$t('common.inputText')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ $t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import * as CacheApi from '@/api/sys/cache'
import { StorageCacheEnum } from '@/api/sys/cache'

defineOptions({ name: 'SysCacheFormSave' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)

const defaultData: CacheApi.SysCacheInfoDo = {
  id: undefined,
  name: '',
  expireTimes: [
    { storageCache: StorageCacheEnum.CAFFEINE, expireTime: 300 },
    { storageCache: StorageCacheEnum.REDIS, expireTime: 600 }
  ],
  remark: ''
}

const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  name: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  expireTimes: [
    {
      validator: (_: any, val: CacheApi.CacheExpireTime[], cb: any) => {
        if (!val || val.length === 0) return cb(new Error(t('common.nonNull')))
        if (val.some((v) => v.expireTime == null || v.expireTime < 0)) return cb(new Error(t('common.nonNull')))
        cb()
      },
      trigger: 'change'
    }
  ]
})
const formRef = ref()

const open = async (name: string | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  if (name) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      const resp = (await CacheApi.getCacheInfo(name)).data
      if ((resp as any).localExpireTime || (resp as any).remoteExpireTime) {
        const arr: CacheApi.CacheExpireTime[] = []
        if ((resp as any).localExpireTime != null) arr.push({ storageCache: StorageCacheEnum.CAFFEINE, expireTime: (resp as any).localExpireTime })
        if ((resp as any).remoteExpireTime != null) arr.push({ storageCache: StorageCacheEnum.REDIS, expireTime: (resp as any).remoteExpireTime })
        ;(resp as any).expireTimes = arr
      }
      modelValue.value = resp
    } finally {
      formLoading.value = false
    }
  } else {
    dialogTitle.value = t('action.create')
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = modelValue.value as CacheApi.SysCacheInfoDo
    if (!modelValue.value.id) {
      await CacheApi.createCacheInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await CacheApi.updateCacheInfo(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  modelValue.value = cloneDeep(defaultData)
}

const addExpire = () => {
  modelValue.value.expireTimes.push({ storageCache: StorageCacheEnum.CAFFEINE, expireTime: 60 })
}
const removeExpire = (idx: number) => {
  modelValue.value.expireTimes.splice(idx, 1)
}
</script>
