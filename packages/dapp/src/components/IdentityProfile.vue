<template>
  <div style="text-align:center">
    <apexchart
      :options="chartOptions"
      :series="scoreValue"
      height="250"
      type="radialBar"
    ></apexchart>
  </div>
</template>
<script>
export default {
  name: 'IdentityProfile',
  props: {
    profileData: {
      type: Array,
      default: () => [],
      required: false,
    },
  },
  data: function() {
    return {
      scoreValue: [],
      chartOptions: {
        chart: {
          height: 60,
          type: 'radialBar',
        },
        colors: ['#20E647'],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '70%',
              background: '#5436D6',
            },
            track: {
              dropShadow: {
                enabled: false,
                top: 2,
                left: 0,
                blur: 4,
                opacity: 0.15,
              },
            },
            dataLabels: {
              name: {
                offsetY: -10,
                color: '#fff',
                fontSize: '13px',
              },
              value: {
                color: '#fff',
                fontSize: '30px',
                show: true,
                formatter: function(val) {
                  return val + '';
                },
              },
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            gradientToColors: ['#87D4F9'],
            stops: [0, 100],
          },
        },
        stroke: {
          lineCap: 'round',
        },
        labels: ['Score'],
      },
    };
  },
  created: function() {
    this.calculateScore();
  },
  methods: {
    calculateScore: function() {
      const score = this.profileData.length * 50;
      this.scoreValue.push(score);
    },
  },
};
</script>
<style scoped></style>
