const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express()
const validUrl =  require('valid-url')
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('views'))

app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls })
})

app.get('/url', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('urldatabase', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) =>{
	try{
		if(validUrl.isUri(req.body.fullUrl)){
			let url = await ShortUrl.find({ full: req.body.fullUrl })
			if(JSON.stringify(url) == '[]') {
				let newurl = await ShortUrl.create({ full: req.body.fullUrl })
				res.redirect(`/?{"url":"${newurl.full}","short":"${newurl.short}"}`);
			}else{
				res.redirect(`/?{"url":"${url[0].full}","short":"${url[0].short}"}`);
			}
		}else{
			res.redirect('/?{"error":"Invalid Url"}')
		}
  }catch (err){
    if(err) throw err;
  }
})

app.get('/url', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('urldatabase', { shortUrls: shortUrls })
})

app.get('/404', (req, res) => {
	res.sendFile(__dirname + '/views/404.html')
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null ) return res.redirect('/404')

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
    
})
app.listen(process.env.PORT || 5000);
