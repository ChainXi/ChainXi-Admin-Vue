<template>
  <el-row class="justify-end !children-ml-1">
    <el-tooltip effect="dark" :content="showSearch ? $t('common.gone') : $t('common.visable')" placement="top" v-if="search">
      <el-button circle @click="toggleSearch()">
        <Icon :icon="showSearch ? 'ep:view' : 'ep:hide'" style="color: #4b4b4b" />
      </el-button>
    </el-tooltip>

    <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
      <el-button circle @click="refresh()">
        <Icon icon="ep:refresh" style="color: #4b4b4b" />
      </el-button>
    </el-tooltip>
    <span>
      <el-dropdown :hide-on-click="false" trigger="click">
        <span>
          <el-tooltip effect="dark" :content="$t('common.columnController')" placement="top" v-if="columns">
            <el-button circle>
              <Icon icon="ep:menu" style="color: #4b4b4b" />
            </el-button>
          </el-tooltip>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in columns">
              <el-checkbox class="w-full" :disabled="item.ignore" :label="item.label" v-model="item.visiable" border />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </span>
  </el-row>
</template>
<script lang="ts">
import { TagSwitch } from '@/types/table'
import { PropType } from 'vue'

export default {
  name: 'RightToolbar',
  data() {
    return {
      // 显隐数据
      value: [],
      // 弹出层标题
      title: '显示/隐藏',
      // 是否显示弹出层
      open: false
    }
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array as PropType<TagSwitch[]>
    },
    search: {
      type: Boolean,
      default: true
    },
    gutter: {
      type: Number,
      default: 10
    }
  },
  created() {
    // 显隐列初始默认隐藏列
    for (let item in this.columns) {
      if (this.columns[item].visible === false) {
        this.value.push(parseInt(item))
      }
    }
  },
  methods: {
    // 搜索
    toggleSearch() {
      this.$emit('update:showSearch', !this.showSearch)
    },
    // 刷新
    refresh() {
      this.$emit('refresh')
    },
    // 右侧列表元素变化
    dataChange(data) {
      for (let item in this.columns) {
        const key = this.columns[item].key
        this.columns[item].visible = !data.includes(key)
      }
    },
    // 打开显隐列dialog
    showColumn() {
      this.open = true
    }
  }
}
</script>
<style lang="scss" scoped></style>
