<template>
  <el-scrollbar height="calc(100vh - 88px - 40px - 50px)">
    <el-row>
      <!-- 基本信息 -->
      <el-col :span="24" class="card-box" shadow="hover">
        <el-card>
          <el-descriptions :title="$t('redisManager.baseInfo')" :column="6" border>
            <el-descriptions-item :label="$t('redisManager.redis_version')">
              {{ cache?.info?.redis_version }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.redis_mode')">
              {{ cache?.info?.redis_mode == 'standalone' ? $t('redisManager.standalone') : $t('redisManager.cluster') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.tcp_port')">
              {{ cache?.info?.tcp_port }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.connected_clients')">
              {{ cache?.info?.connected_clients }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.uptime_in_days')">
              {{ cache?.info?.uptime_in_days }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.used_memory_human')">
              {{ cache?.info?.used_memory_human }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.used_cpu_user_children')">
              {{ cache?.info ? parseFloat(cache?.info?.used_cpu_user_children).toFixed(2) : '' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.maxmemory_human')">
              {{ cache?.info?.maxmemory_human }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.aof_enabled')">
              {{ cache?.info?.aof_enabled == '0' ? '否' : '是' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.rdb_last_bgsave_status')">
              {{ cache?.info?.rdb_last_bgsave_status }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.dbSize')">
              {{ cache?.dbSize }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('redisManager.instantaneous_input_kbps')">
              {{ cache?.info?.instantaneous_input_kbps }}kps/ {{ cache?.info?.instantaneous_output_kbps }}kps
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <!-- 命令统计 -->
      <el-col :span="12" class="mt-3">
        <el-card :gutter="12" shadow="hover">
          <Echart :options="commandStatsRefChika" :height="420" />
        </el-card>
      </el-col>
      <!-- 内存使用量统计 -->
      <el-col :span="12" class="mt-3">
        <el-card class="ml-3" :gutter="12" shadow="hover">
          <Echart :options="usedmemoryEchartChika" :height="420" />
        </el-card>
      </el-col>
    </el-row>
  </el-scrollbar>
</template>
<script lang="ts" setup>
import * as RedisApi from '@/api/infra/redis'
import { RedisMonitorInfoVO } from '@/api/infra/redis/types'
import { EChartsOption, LegendComponentOption } from 'echarts'
const { t } = useI18n()
const cache = ref<RedisMonitorInfoVO>()

// 基本信息
const readRedisInfo = async () => {
  cache.value = (await RedisApi.getCache()).data
}

// 内存使用情况
const usedmemoryEchartChika = reactive<any>({
  title: {
    // 仪表盘标题。
    text: t('redisManager.memoryUsage'),
    left: 'center',
    show: true, // 是否显示标题,默认 true。
    offsetCenter: [0, '20%'], //相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
    color: 'yellow', // 文字的颜色,默认 #333。
    fontSize: 20 // 文字的字体大小,默认 15。
  },
  toolbox: {
    show: false,
    feature: {
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  series: [
    {
      name: t('redisManager.maxVlaue'),
      type: 'gauge',
      zlevel: 0,
      z: 2,
      min: 0,
      max: 50,
      splitNumber: 10,
      //这是指针的颜色
      color: '#F5C74E',
      radius: '85%',
      center: ['50%', '50%'],
      startAngle: 225,
      endAngle: -45,
      axisLine: {
        // 坐标轴线
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [
            [0.2, '#7FFF00'],
            [0.8, '#00FFFF'],
            [1, '#FF0000']
          ],
          //width: 6 外框的大小（环的宽度）
          width: 10
        }
      },
      axisTick: {
        // 坐标轴小标记
        //里面的线长是5（短线）
        length: 5, // 属性length控制线长
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: '#76D9D7'
        }
      },
      splitLine: {
        // 分隔线
        length: 20, // 属性length控制线长
        lineStyle: {
          // 属性lineStyle（详见lineStyle）控制线条样式
          color: '#76D9D7'
        }
      },
      axisLabel: {
        color: '#76D9D7',
        distance: 15,
        fontSize: 15
      },
      pointer: {
        // 指针的大小
        width: 7,
        show: true
      },
      detail: {
        fontWeight: 'normal',
        // 里面文字下的数值大小（50）
        fontSize: 15,
        color: '#FFFFFF',
        valueAnimation: true
      },
      progress: {
        show: true
      }
    }
  ]
})

// 指令使用情况
const commandStatsRefChika: EChartsOption = reactive({
  title: {
    text: t('redisManager.commandAnalystic'),
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    zlevel: 0,
    z: 2,
    type: 'scroll',
    orient: 'vertical',
    right: 30,
    top: 10,
    bottom: 20,
    data: [],
    textStyle: {
      color: '#a1a1a1'
    }
  },
  series: [
    {
      name: t('redisManager.command'),
      type: 'pie',
      zlevel: 0,
      z: 2,
      radius: [20, 120],
      center: ['40%', '60%'],
      data: [] as any[],
      roseType: 'radius',
      label: {
        show: true
      },
      emphasis: {
        label: {
          show: true
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

/** 加载数据 */
const getSummary = () => {
  // 初始化命令图表
  initCommandStatsChart()
  usedMemoryInstance()
}

/** 命令使用情况 */
const initCommandStatsChart = async () => {
  usedmemoryEchartChika.series[0].data = []
  // 发起请求
  try {
    const data = (await RedisApi.getCache()).data
    cache.value = data
    // 处理数据
    const commandStats = [] as any[]
    const nameList = [] as string[]
    data.commandStats.forEach((row) => {
      commandStats.push({
        name: row.command,
        value: row.calls
      })
      nameList.push(row.command)
    })
    const legend = commandStatsRefChika.legend as LegendComponentOption
    legend.data = nameList
    commandStatsRefChika.series[0].data = commandStats
  } catch {}
}
const usedMemoryInstance = async () => {
  try {
    const data = (await RedisApi.getCache()).data
    cache.value = data
    // 仪表盘详情，用于显示数据。
    usedmemoryEchartChika.series[0].detail = {
      show: true, // 是否显示详情,默认 true。
      offsetCenter: [0, '50%'], // 相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
      color: 'inherit', // 文字的颜色,默认 inherit
      fontSize: 30, // 文字的字体大小,默认 15。
      formatter: cache.value!.info.used_memory_human // 格式化函数或者字符串
    }

    usedmemoryEchartChika.series[0].data[0] = {
      value: cache.value!.info.used_memory_human,
      name: t('redisManager.memoryUsage')
    }
    console.debug(cache.value!.info)
    usedmemoryEchartChika.tooltip = {
      formatter: '{b} <br/>{a} : ' + cache.value!.info.used_memory_human
    }
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  // 读取 redis 信息
  readRedisInfo()
  // 加载数据
  getSummary()
})
</script>
