const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const Twit = require('twit');
const config = require('./config.json');
const path = require('path');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const PORT = process.env.PORT || 3004;

const T = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret
});

app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

nunjucks.configure('views', {
	autoescape: true,
	noCache: true,
	express: app
});

function getFullText (tweet) {
	let result;

	if (tweet.retweeted_status) {
		if (tweet.retweeted_status.full_text) {
			result = tweet.retweeted_status.full_text;
		} else if (tweet.retweeted_status.extended_tweet) {
			result = tweet.retweeted_status.extended_tweet.full_text;
		} else {
			result = tweet.text;
		}
	} else {
		result = tweet.full_text || tweet.text;
	}

	return result;
}

app.get('/', (req, res) => {
	return res.render('index.html');
});

app.get('/search/:q', (req, res) => {
	const params = {
		q: req.params.q,
		result_type: 'recent',
		tweet_mode: 'extended',
		lang: 'en',
		include_entities: false,
		count: req.query.count || 100
	}

	T.get('search/tweets', params, (err, data, response) => {
		if (err) {
			console.log(err);
			return res.json({
				success: false,
				message: 'Server error'
			});
		}

		const tweets = data.statuses.map((tweet) => {
			const data = {
				sentiment: {},
				full_text: null,
				user: tweet.user,
				timestamp: tweet.created_at
			}

			data.full_text = getFullText(tweet);
			data.sentiment = sentiment.analyze(data.full_text);

			return data;
		});

		return res.json({
			success: true,
			data: tweets
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}...`);
});
