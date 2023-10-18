const express = require('express')
const session = require('express-session')
const { createClient } = require('@supabase/supabase-js')
const { generateString } = require('./functions.js')
function isLoggedIn(req,res,next) {
    req.user ? next() : res.redirect("/login")
}
const validUrl =  require('valid-url')
require('./auth')
const passport = require('passport')
const app = express()

app.use(session({ secret: process.env.SECRET}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('views'))

const supabaseUrl = process.env.supabaseUrl
const supabaseKey = process.env.supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)


app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/login/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
)
app.get('/login/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login/auth/failure'
     })
)
app.get('/login/auth/failure', (req,res) => {
    res.send('Failed to authenticate..')
})
app.get('/',isLoggedIn , async (req,res ) => {
    res.render('index');
})


app.post('/shortUrls', async (req, res) =>{
	try{
		if(validUrl.isUri(req.body.fullUrl)){
            let { data: urls, error } = await supabase
            .from('urls')
            .select('*')
            .eq('fullurl',req.body.fullUrl)
			if(urls.length == 0) {
				let b = 1;
                while (b == 0){
                    let newurl = generateString(8)
                    let { data : urls, error} = await supabase
                    .from('urls')
                    .select('*')
                    .eq('shortid',newurl)
                    b = urls.length;
                }
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
