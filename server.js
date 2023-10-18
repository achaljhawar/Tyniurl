const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const { generateString } = require('./functions.js')
const app = express()
const validUrl =  require('valid-url')
require('dotenv').config()

const supabaseUrl = process.env.supabaseUrl
const supabaseKey = process.env.supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)

app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('views'))

app.get('/', async (req, res) => {
    res.render('index')
})

app.post('/shortUrls', async (req, res) =>{
	try{
		if(validUrl.isUri(req.body.fullUrl)){
            let { data: urls, error } = await supabase
            .from('urls')
            .select('*')
            .eq('fullurl',req.body.fullUrl)
			if(urls.length == 0) {
				let newurl = generateString(8)
                const { data, error } = await supabase
                .from('urls')
                .insert([
                  { fullurl: req.body.fullUrl, shortid: newurl },
                ])
                .select()
				res.redirect(`/?{"url":"${req.body.fullUrl}","short":"${newurl}"}`);
			}else{
				res.redirect(`/?{"url":"${urls[0]['fullurl']}","short":"${urls[0]['shortid']}"}`);
			}
		}else{
			res.redirect('/?{"error":"Invalid Url"}')
		}
  }catch (err){
    if(err) throw err;
  }
})

app.get('/404', (req, res) => {
	res.sendFile(__dirname + '/views/404.html')
})

app.get('/:shortUrl', async (req, res) => {
    let { data: urls, error } = await supabase
    .from('urls')
    .select('*')
    .eq('shortid',req.params.shortUrl)
    const fullurl = urls[0]['fullurl']

    if (fullurl.length == 0 ) return res.redirect('/404')
    res.redirect(fullurl)
    
})

app.listen(process.env.PORT || 5000);
