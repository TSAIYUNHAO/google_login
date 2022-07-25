const req = require("express/lib/request");
const passport =require("passport");
const GoogleStrategy =require("passport-google-oauth20");
const User = require("../models/user-model");
const Localstrategy= require("passport-local");
const bcrypt=require("bcryptjs");
 




passport.serializeUser((user,done) =>{
       console.log("Serializing user now");
       done(null,user._id);
});

passport.deserializeUser((_id,done) =>{
       console.log("Deserializing user now");
       User.findById({_id}).then((user) =>{
              console.log("Found user.");
              done(null,user);
       });
});
passport.use(new Localstrategy((username,password,done)=>{
       console.log(username,password);
       User.findOne({email:username}).then(async(user)=>{
              if(!user){
                 return done(null,false);
              }
             await bcrypt.compare(password,user.password,function(err,result){
                if(err){
                     return done(null,false);
                }
                if(!result){
                     return done(null,false);
                }
              });
              return done(null,user);
       }).catch((err) =>{
              return done(null,false);
       })
}))

passport.use(new GoogleStrategy({
       clientID:process.env.GOOGLE_CLIENT_ID,
       clientSecret:process.env.GOOGLE_CLIENT_SECRET,
       callbackURL:"https://arcane-sea-38331.herokuapp.com/auth/google/redirect"
},
(accessToken,refreshToken,profile,done)=>{
   console.log(profile);
   User.findOne({googleID:profile.id}).then((foundUser) =>{
          if (foundUser){
              console.log("User already exist");
                done(null,foundUser);
          }else{
                const user= new User({
                   name: profile.displayName,
                   googleID:profile.id,
                   thumbnail:profile.photos[0].value,
                   email:profile.email[0].value,
                 }).save().then((newUser)=>{
                        console.log("New user created.");
                        done(null,newuser);
                 })
          }
       
   });
          
}
)
);