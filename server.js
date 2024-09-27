const express = require('express')
const session = require('express-session')
const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')
const { generateString } = require('./functions.js')
function isLoggedIn(req,res,next) {
    req.user ? next() : res.redirect("/login")
}
require('dotenv').config()
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
app.use(express.json())
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
    failureRedirect: '/login/auth/failure',
    scope: ['profile', 'email']
  })
)
app.get('/login/auth/failure', (req,res) => {
  res.send('Failed to authenticate..')
})
app.get('/',isLoggedIn , async (req,res ) => {
  res.render('index');
})

app.get('/dashboard',isLoggedIn , async (req,res ) => {
  let { data : urls_acm, error} = await supabase
  .from('urls_acm')
  .select('*')
  .eq('email',req.user.email)

  res.render('dashboard', { shortUrls: urls_acm });
})
app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.email}`);
});
/*
app.post('/shortUrls', async (req, res) =>{
  if (req.body.customshort.trim().length === 0){
    try{
      if(validUrl.isUri(req.body.fullUrl)){
        let { data: urls, error } = await supabase
        .from('urls')
        .select('*')
        .eq('fullurl',req.body.fullUrl)
        if(urls.length == 0) {
          let newurl="";
          let b = 1;
          while (b != 0){
            newurl = generateString(8)
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
  } else {
    try {
      if(validUrl.isUri(req.body.fullUrl)){
        let { data: urls, error } = await supabase
        .from('urls')
        .select('*')
        .eq('shortid',req.body.customshort.trim())
        if (urls.length === 0){
          let {data, error} = await supabase
          .from('urls')
          .insert([
            { fullurl: req.body.fullUrl, shortid: req.body.customshort.trim() },
          ])
          res.redirect(`/?{"url":"${req.body.fullUrl}","short":"${req.body.customshort.trim()}"}`);
        } else {
          res.redirect('/?{"error":"Invalid shortid"}')
        }
      } else {
        res.redirect('/?{"error":"Invalid Url"}')
      }
    } catch (err){
      if(err) throw err;
    }
  }
})
*/
app.post('/shortUrls', async (req, res) =>{
  if (req.body.customshort.trim().length === 0){
    try{
      if(validUrl.isUri(req.body.fullUrl)){
        let { data: urls_acm, error } = await supabase
        .from('urls_acm')
        .select('*')
        .eq('fullurl',req.body.fullUrl)
        if(urls_acm.length == 0) {
          let newurl="";
          let b = 1;
          while (b != 0){
            newurl = generateString(8)
            let { data : urls_acm, error} = await supabase
            .from('urls_acm')
            .select('*')
            .eq('shortid',newurl)
            b = urls_acm.length;
          }
          const { data, error } = await supabase
          .from('urls_acm')
          .insert([
            { fullurl: req.body.fullUrl, shortid: newurl, email: req.user.email, clicks: 0},
          ])
          .select()
          res.redirect(`/?{"url":"${req.body.fullUrl}","short":"${newurl}"}`);
        }else{
          if (urls_acm[0]["email"] == req.user.email){
            res.redirect(`/?{"url":"${urls_acm[0]['fullurl']}","short":"${urls_acm[0]['shortid']}"}`)
          }
          /*
            clicks = urls_acm[0]['clicks']
            const { data, error } = await supabase
              .from('urls_acm')
              .update({ clicks: clicks+1 })
              .eq('fullurl', urls_acm[0]['shortid'])
              .select()
          */
        }
      }else{
        res.redirect('/?{"error":"Invalid Url"}')
      }
    }catch (err){
      if(err) throw err;
    }
  } else {
    try {
      if(validUrl.isUri(req.body.fullUrl)){
        let { data: urls_acm, error } = await supabase
        .from('urls_acm')
        .select('*')
        .eq('shortid',req.body.customshort.trim())
        if (urls_acm.length === 0){
          let {data, error} = await supabase
          .from('urls_acm')
          .insert([
            { fullurl: req.body.fullUrl, shortid: req.body.customshort.trim(), email: req.user.email},
          ])
          res.redirect(`/?{"url":"${req.body.fullUrl}","short":"${req.body.customshort.trim()}"}`);
        } else {
          res.redirect('/?{"error":"Invalid shortid"}')
        }
      } else {
        res.redirect('/?{"error":"Invalid Url"}')
      }
    } catch (err){
      if(err) throw err;
    }
  }
})


app.get('/404', (req, res) => {
	res.sendFile(__dirname + '/views/404.html')
})

app.get('/:shortUrl', async (req, res) => {
  let { data: urls_acm, error } = await supabase
  .from('urls_acm')
  .select('*')
  .eq('shortid',req.params.shortUrl)
  if (urls_acm === null || urls_acm === undefined) {
    return res.redirect('/404');
  }
  if (urls_acm.length === 0) {
    return res.redirect('/404');
  }else{
    clicks = urls_acm[0]['clicks']
    const { data, error } = await supabase
      .from('urls_acm')
      .update({ clicks: clicks+1 })
      .eq('shortid', urls_acm[0]['shortid'])
      .select()
    res.redirect(urls_acm[0]['fullurl'])
  }
})
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.google.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(emails, shorturl) {
  try {
    await transporter.sendMail({
      from: {
        name: 'Tyniurl',
        address: `${process.env.EMAIL}`
      },
      to: `${emails}`,
      subject: "someone shared a url with you",
      text: `http://localhost:3000/${shorturl}`
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
app.post('/emails', async (req, res) =>{
  const ok = req.body;
  const email = ok.email;
  const emails = ok.emails;
  const shorturl =ok.shorturl;
  console.log(ok)
  sendEmail(emails,shorturl)
  return res.status(200);
})

app.listen(process.env.PORT || 3000);