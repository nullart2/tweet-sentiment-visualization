const socket = io.connect();

new Vue({
	el: '#app',

	delimiters: ['<%', '%>'],

	mixins: [Vue2Filters.mixin],

	created () {
		socket.on('SOCKET_ID', (id) => {
			console.log('Socket Id', id);
			this.socketId = id;
		});

		this.query = 'Donald Trump';
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
	}),

	methods: {
		async search () {
			try {
				const res = await fetch(`/search/${this.query}`);
				const data = await res.json();
				this.title = this.query;
				
				if (data.success) {
					this.statuses = data.data;
					console.log(this.statuses)
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
		}
	}
});