<template>
  <a-space align="start">
    <template v-if="lives">
      <a-card :style="{ width: '256px' }">
        <template #cover>
          <icon-font :type="lives.icon" :size="128" />
        </template>
        <a-card-meta>
          <template #avatar>
            <a-statistic :title="lives.title" :value="lives.temperature" show-group-separator>
              <template #prefix> {{ lives.weather }}&nbsp;&nbsp;&nbsp;&nbsp;</template>
              <template #suffix> °C </template>
            </a-statistic>
          </template>
        </a-card-meta>
      </a-card>
    </template>

    <template v-if="forecasts">
      <a-card v-for="(item, index) in forecasts.casts" :key="index" :style="{ width: '128px' }">
        <div class="forecasts">
          <icon-font :type="item.icon" :size="64" />
          <a-statistic :title="item.date" :value="item.daytemp">
            <template #prefix>
              {{ item.dayweather }}&nbsp;&nbsp;&nbsp;{{ item.nighttemp }} -
            </template>
            <template #suffix> °C </template>
          </a-statistic>
        </div>
      </a-card>
    </template>
  </a-space>
</template>

<script setup>
import { onMounted, reactive, toRefs } from 'vue'
import axios from 'axios'
import { pinyin } from 'pinyin-pro'

const state = reactive({
  lives: {
    // province: '四川',
    // city: '成都市',
    // adcode: '510100',
    // weather: '雾', // 天气现象（汉字描述）
    // temperature: '7', // 实时气温，单位：摄氏度
    // winddirection: '北', // 风向描述
    // windpower: '≤3', // 风力级别，单位：级
    // humidity: '58', // 空气湿度
    // reporttime: '2024-02-03 17:36:46', //数据发布的时间
    // temperature_float: '7.0',
    // humidity_float: '58.0'
  },
  forecasts: {
    // city: '成都市',
    // adcode: '510100',
    // province: '四川',
    // reporttime: '2024-02-03 17:36:46',
    // casts: [
    //   {
    //     date: '2024-02-03', // 日期
    //     week: '6', // 星期几
    //     dayweather: '小雨', // 白天天气现象
    //     nightweather: '小雨', // 晚上天气现象
    //     daytemp: '7', // 白天温度
    //     nighttemp: '3', // 晚上温度
    //     daywind: '南', // 白天风向
    //     nightwind: '南', //晚上风向
    //     daypower: '1-3', // 白天风力
    //     nightpower: '1-3', // 晚上风力
    //     daytemp_float: '7.0',
    //     nighttemp_float: '3.0'
    //   }
    // ]
  }
})

const baseUrl = import.meta.env.MODE === 'development' ? '/restapi' : 'https://restapi.amap.com'

onMounted(() => {
  getWeatherInfo()
})

const getWeatherInfo = () => {
  axios
    .get(baseUrl + '/v3/ip', {
      params: { key: '5d109a02b15ce12084f193e845532244' }
    })
    .then(({ data }) => {
      // console.log('ip', data)
      return Promise.all([
        axios.get(baseUrl + '/v3/weather/weatherInfo', {
          params: { city: data.adcode, key: '5d109a02b15ce12084f193e845532244', extensions: 'base' }
        }),
        axios.get(baseUrl + '/v3/weather/weatherInfo', {
          params: { city: data.adcode, key: '5d109a02b15ce12084f193e845532244', extensions: 'all' }
        })
      ])
    })
    .then((data) => {
      // console.log(data[0].data.lives[0], data[1].data.forecasts[0])
      state.lives = data[0].data.lives.map((item) => {
        item.temperature = Number(item.temperature)
        item.title = item.province + '  ' + item.city
        item.icon = `icon-tianqi-${pinyin(item.weather, { toneType: 'none' }).replace(/\s/g, '')}`
        return item
      })[0]
      state.forecasts = data[1].data.forecasts[0]
      state.forecasts.casts = state.forecasts.casts.map((item) => {
        const days = ['一', '二', '三', '四', '五', '六', '天']
        item.weekDay = '星期' + days[item.week - 1]
        item.temp = item.nighttemp + ' - ' + item.daytemp + '°C'
        item.icon = `icon-tianqi-${pinyin(item.dayweather, { toneType: 'none' }).replace(
          /\s/g,
          ''
        )}`
        item.daytemp = Number(item.daytemp)
        item.nighttemp = Number(item.nighttemp)
        return item
      })
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
    })
}

const { lives, forecasts } = toRefs(state)
</script>

<style scoped>
.forecasts {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
