const socket = io.connect();
Vue.config.productionTip = false;

new Vue({
	el: '#app',

	delimiters: ['<%', '%>'],

	mixins: [Vue2Filters.mixin],

	created () {
		socket.on('SOCKET_ID', (id) => {
			console.log('Your socket ID', id);
			this.socketId = id;
		});

		this.query = 'Trump';
		this.search();

		socket.on('TWEET', (tweet) => {
			this.statuses.push(tweet);
		});
	},

	data: () => ({
		socketId: null,
		title: null,
		query: null,
		statuses: [],
		tab: null
	}),

	methods: {
		async search () {
			try {
				const res = await fetch(`/search/${this.query}`);
				const data = await res.json();
				this.title = this.query;

				if (data.success) {
					this.statuses = data.data;
					socket.emit('TRACK', {
						socketId: this.socketId,
						track: this.query
					});
				}
			} catch (error) {
				console.log(error);
			}
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