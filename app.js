//jshint esversion:6

const express= require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const app=express()

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema={
    email:String,
    password:String
};

const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){

    res.render("home")
})
app.get("/login",function(req,res){

    res.render("login")
})
app.post("/login",function(req,res){
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser)
            {
                if(foundUser.password ===password)
                {
                    res.render("secrets");
                }
              
            }
        }
    })
})
app.get("/register",function(req,res){

    res.render("register")
})

app.post("/register",function(req,res){
    
const newuser=new User( {
    email:req.body.username,
    password:req.body.password
});
newuser.save(function(err){
    if(err)
    {console.log(err);}
    else{
        res.render("secrets");
    }
});



})

app.listen(3000,function(){

    console.log("server is running at 3000")
})
