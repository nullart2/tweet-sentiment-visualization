Vue.config.productionTip = false;

new Vue({
	el: '#app',

	delimiters: ['<%', '%>'],

	mixins: [Vue2Filters.mixin],

	created () {this.query = 'Donald Trump';
		this.search();
	},

	data: () => ({
		title: null,
		query: null,
		statuses: [],
		tab: null,
		loading: false
	}),

	methods: {
		async search () {
			this.loading = true;
			try {
				const res = await fetch(`/search/${this.query}`);
				const data = await res.json();
				this.title = this.query;

				if (data.success) {
					this.statuses = data.data;
				}
			} catch (error) {
				console.log(error);
			}
			this.loading = false;
		}
	},

	computed: {
		pieChartData () {
			const positives = this.statuses.filter(status => status.sentiment.score > 0).length;
			const negatives = this.statuses.filter(status => status.sentiment.score < 0).length;

			const datasets = [
			{
				label: 'Total',
				backgroundColor: ['#2196F3', '#F44336'],
				data: [positives, negatives]
			}
			];

			return {
				labels: ['Positive', 'Negative'],
				datasets: datasets
			}
		},

		barChartData () {
			const positives = [].concat.apply([], this.statuses.map((status) => {
				return status.sentiment.positive;
			})).length;

			const negatives = [].concat.apply([], this.statuses.map((status) => {
				return status.sentiment.negative;
			})).length;

			// const labels = Array.from(new Set(words));

			const datasets = [
			{
				label: 'P v N Words',
				backgroundColor: ['#2196F3', '#F44336'],
				data: [positives, negatives]
			}
			];

			return {
				labels: ['Positive', 'Negative'],
				datasets: datasets
			}
		},

		latest () {
			return this.statuses.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));
		}
	},

	components: {
		'pie-chart': {
			extends: VueChartJs.Pie,
			mixins: [VueChartJs.mixins.reactiveProp],
			props: ['chartData'],
			mounted () {
				console.log('Pie Chart Connected');
				this.renderChart(this.chartData, {responsive: true, maintainAspectRatio: false});
			}
		},
		'bar-chart': {
			extends: VueChartJs.Bar,
			mixins: [VueChartJs.mixins.reactiveProp],
			props: ['chartData'],
			mounted () {
				console.log('Bar Chart Connected');
				this.renderChart(this.chartData, {responsive: true, maintainAspectRatio: false});
			}
		}
	},

	filters: {
		moment (val) {
			return moment(val, 'ddd MMM DD HH:mm:ss Z YYYY').format('MMMM D, YYYY, h:mm:ss a');
		}
	}
});
