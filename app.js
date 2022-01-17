//jshint esversion:6

require("dotenv").config()
const express= require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate=require("mongoose-findorcreate");


//Level 4 const bcrypt=require("bcrypt");
// const saltRounds=10;
// Level 3 const md5=require("md5")
// Level 2 Encryption const encrypt=require("mongoose-encryption")

const app=express()
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret:"hacker ki maa ki choomt",
    resave:false,
    saveUninitialized:false   
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");
//mongoose.set("useCreateIndex",true);

const userSchema= new mongoose.Schema({
    email:String,
    password:String,
    googleId:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",function(req,res){

    res.render("home")
});

app.get("/register",function(req,res){

    res.render("register");
});
app.get("/login",function(req,res){

    res.render("login")
});

app.get("/secrets",function(req,res){

    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }

});
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.post("/register",function(req,res){
    
    User.register({username:req.body.username},req.body.password,function(err,user){

        if(err)
        {
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req,res,function(){
               res.redirect("/secrets");
            });
        }
    });
});


app.post("/login",function(req,res){
    
    const user=new User({
      username:req.body.username,
      password:req.body.password
    });
    req.login(user,function(err){
        if(err){
        console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});


app.listen(3000,function(){

    console.log("server is running at 3000")
});
